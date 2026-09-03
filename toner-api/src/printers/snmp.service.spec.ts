import * as snmp from 'net-snmp';
import type { Session, Varbind } from 'net-snmp';
import { SnmpService } from './snmp.service';

/**
 * 消耗品の表の読み取り。
 *
 * 表は**列ごとに 1 本ずつ歩く**ので、列によって読めた行数が食い違うことがある。
 * SNMP は UDP で、返事が 1 つ落ちれば net-snmp はそこで歩くのをやめるため、
 * 取れたところまでを黙って使うと「ドラムも定着も無い機器」に見えてしまう。
 * ここではその 2 つ（列の食い違い・途中で切れる）を再現する。
 *
 * 行の中身は**実機（Canon iR-ADV C3520 III / 172.31.1.203）の 11 行**をそのまま
 * 置いてある。トナー 4 色・廃トナー・ドラム 4 色・定着・ADF の並び。
 */

/** EPSON の用紙サイズ別カウンタ表。行は用紙サイズ、列が意味を表す */
const EPSON = {
  total: '1.3.6.1.4.1.1248.1.2.2.6.1.1.4',
  color: '1.3.6.1.4.1.1248.1.2.2.6.1.1.5',
} as const;

const COLUMN = {
  description: '1.3.6.1.2.1.43.11.1.1.6',
  colorantIndex: '1.3.6.1.2.1.43.11.1.1.3',
  class: '1.3.6.1.2.1.43.11.1.1.4',
  type: '1.3.6.1.2.1.43.11.1.1.5',
  maxCapacity: '1.3.6.1.2.1.43.11.1.1.8',
  level: '1.3.6.1.2.1.43.11.1.1.9',
  colorantValue: '1.3.6.1.2.1.43.12.1.1.4',
} as const;

/** 実機の 11 行。添字は 1.<行番号> */
const NAMES = [
  'Canon NPG-67 Black Toner',
  'Canon NPG-67 Cyan Toner',
  'Canon NPG-67 Magenta Toner',
  'Canon NPG-67 Yellow Toner',
  'Waste Toner',
  'Black Drum Unit',
  'Cyan Drum Unit',
  'Magenta Drum Unit',
  'Yellow Drum Unit',
  'Fuser Unit',
  'ADF Maintenance Kit',
];

const TYPES = [3, 3, 3, 3, 4, 9, 9, 9, 9, 15, 1];
const LEVELS = [100, 100, 100, 100, 45, 25, 41, 46, 0, 60, 95];

/** 1 列ぶんの中身。添字 → 値 */
type Rows = Map<string, number | string>;

function column(values: (number | string)[]): Rows {
  return new Map(values.map((value, position) => [`1.${position + 1}`, value]));
}

const FULL: Record<string, Rows> = {
  [COLUMN.description]: column(NAMES),
  [COLUMN.type]: column(TYPES),
  [COLUMN.level]: column(LEVELS),
  [COLUMN.maxCapacity]: column(LEVELS.map(() => 100)),
  [COLUMN.class]: column(LEVELS.map(() => 3)),
  [COLUMN.colorantIndex]: column([1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 0]),
  [COLUMN.colorantValue]: column(['black', 'cyan', 'magenta', 'yellow']),
};

/** その列をどう返すか。cutAfter で「n 行返したところで応答が落ちる」を作る */
type Behavior = { rows?: Rows; cutAfter?: number; failTimes?: number };

/**
 * subtree だけを持つ偽のセッション。
 * 1 行ずつ feedCb に渡し、最後に doneCb を呼ぶのは net-snmp と同じ。
 * 途中で落ちたときは、そこまで渡してから doneCb にエラーを渡す
 */
function fakeSession(behaviors: Record<string, Behavior> = {}): Session {
  const attempts = new Map<string, number>();

  const subtree = (
    base: string,
    _max: number,
    feedCb: (varbinds: Varbind[]) => void,
    doneCb: (error: Error | null) => void,
  ) => {
    const behavior = behaviors[base] ?? {};
    const rows = behavior.rows ?? FULL[base] ?? new Map<string, never>();

    const attempt = (attempts.get(base) ?? 0) + 1;
    attempts.set(base, attempt);

    // failTimes 回目までは切れる。引き直しで直る機器を再現する
    const cut =
      behavior.cutAfter !== undefined &&
      attempt <= (behavior.failTimes ?? Number.MAX_SAFE_INTEGER)
        ? behavior.cutAfter
        : null;

    let sent = 0;
    for (const [suffix, value] of rows) {
      if (cut !== null && sent >= cut) {
        doneCb(new snmp.RequestTimedOutError('Request timed out'));
        return;
      }
      feedCb([
        {
          oid: `${base}.${suffix}`,
          type:
            typeof value === 'number'
              ? snmp.ObjectType.Integer
              : snmp.ObjectType.OctetString,
          value: typeof value === 'number' ? value : Buffer.from(value),
        },
      ]);
      sent++;
    }

    doneCb(null);
  };

  return { subtree } as unknown as Session;
}

/** private を突く。表の組み立てだけを見たいので、セッションは偽物で足りる */
function readSupplies(session: Session) {
  const service = new SnmpService();
  return (
    service as unknown as {
      readSupplies: (session: Session) => Promise<{
        supplies: {
          supplyIndex: number;
          name: string;
          supplyType: number | null;
          percent: number | null;
        }[];
        complete: boolean;
        columns: { name: string; rows: number; complete: boolean }[];
      }>;
    }
  ).readSupplies(session);
}

/** private を突く。EPSON の表から色の内訳を出すところだけを見る */
function epsonCounts(session: Session, lifeCount: number | null) {
  const service = new SnmpService();
  return (
    service as unknown as {
      epsonCounts: (
        session: Session,
        lifeCount: number | null,
      ) => Promise<{
        monoCount: number;
        colorCount: number;
        countSource: string;
        printMono: number | null;
      } | null>;
    }
  ).epsonCounts(session, lifeCount);
}

/** 用紙サイズ別の 8 行を作る。A4/Letter（2 行目）だけに数を入れる */
function paperRows(a4: number, a3 = 0): Rows {
  const rows: Rows = new Map();
  for (let size = 1; size <= 8; size++) {
    rows.set(`1.${size}`, size === 2 ? a4 : size === 1 ? a3 : 0);
  }
  return rows;
}

describe('readSupplies', () => {
  it('実機の 11 行をそのまま読む', async () => {
    const result = await readSupplies(fakeSession());

    expect(result.complete).toBe(true);
    expect(result.supplies).toHaveLength(11);
    expect(result.supplies[9]).toMatchObject({
      supplyIndex: 10,
      name: 'Fuser Unit',
      supplyType: 15,
      percent: 60,
    });
  });

  it('説明を返さない行も落とさない', async () => {
    // 定着（10 行目）だけ説明が無い機器。残量も種別も返してきている
    const withoutFuserName = new Map(FULL[COLUMN.description]);
    withoutFuserName.delete('1.10');

    const result = await readSupplies(
      fakeSession({ [COLUMN.description]: { rows: withoutFuserName } }),
    );

    expect(result.complete).toBe(true);
    expect(result.supplies).toHaveLength(11);

    // 名前は出せないが、種別が分かるので「定着 60%」として並べられる
    expect(result.supplies[9]).toMatchObject({
      supplyIndex: 10,
      name: '消耗品 10',
      supplyType: 15,
      percent: 60,
    });
  });

  it('途中で切れても引き直して読めれば complete', async () => {
    const result = await readSupplies(
      fakeSession({ [COLUMN.level]: { cutAfter: 4, failTimes: 1 } }),
    );

    expect(result.complete).toBe(true);
    expect(result.supplies[9].percent).toBe(60);
  });

  it('引き直しても切れたら complete を false にする', async () => {
    // 残量の列が 5 行目で毎回落ちる。ドラム以降が「不明」になる機器
    const result = await readSupplies(
      fakeSession({ [COLUMN.level]: { cutAfter: 5 } }),
    );

    expect(result.complete).toBe(false);

    // 読めた行はそのまま返す。保存するかどうかは呼び出し側が決める
    expect(result.supplies[9]).toMatchObject({
      supplyIndex: 10,
      percent: null,
    });

    const level = result.columns.find((c) => c.name === '残量');
    expect(level).toMatchObject({ rows: 5, complete: false });
  });
});

/**
 * EPSON の色の内訳。
 *
 * 数字は**実機（PX-M791FT / 172.31.25.203）から返ってきた値**をそのまま置いてある。
 * 総ページ数 1708・カラー 240 で、どちらも A4/Letter の行に入っていた。
 * エプソンは私有 MIB を公開しておらず名前の列も無いので、
 * 「総ページ数の合計が prtMarkerLifeCount と一致すること」が唯一の裏付けになる。
 */
describe('epsonCounts', () => {
  it('実機の値からモノクロとカラーを出す', async () => {
    const counts = await epsonCounts(
      fakeSession({
        [EPSON.total]: { rows: paperRows(1708) },
        [EPSON.color]: { rows: paperRows(240) },
      }),
      1708,
    );

    expect(counts).toMatchObject({
      monoCount: 1468,
      colorCount: 240,
      countSource: 'vendor',
    });

    // 機能別の列を持たない機種なので、6 つは空のままにする
    expect(counts?.printMono).toBeNull();
  });

  it('用紙サイズをまたいでも足して 1 台ぶんにする', async () => {
    const counts = await epsonCounts(
      fakeSession({
        [EPSON.total]: { rows: paperRows(7558, 590) },
        [EPSON.color]: { rows: paperRows(4014, 1) },
      }),
      8148,
    );

    expect(counts).toMatchObject({ monoCount: 4133, colorCount: 4015 });
  });

  it('カラーの列が無い機種は読まない', async () => {
    // PX-S381L はモノクロ専用で、カラーの列を 1 行も返さない。
    // ここを「カラー 0」と読むと、モノクロ機をカラー機として扱ってしまう
    const counts = await epsonCounts(
      fakeSession({
        [EPSON.total]: { rows: paperRows(114893) },
        [EPSON.color]: { rows: new Map() },
      }),
      114893,
    );

    expect(counts).toBeNull();
  });

  it('累計と合わない表は読まない', async () => {
    // ファーム更新などで列の意味が変わったとき、黙って別の数字を貯めない
    const counts = await epsonCounts(
      fakeSession({
        [EPSON.total]: { rows: paperRows(900) },
        [EPSON.color]: { rows: paperRows(240) },
      }),
      1708,
    );

    expect(counts).toBeNull();
  });

  it('読んでいる間に数ページ進んだくらいは許す', async () => {
    const counts = await epsonCounts(
      fakeSession({
        [EPSON.total]: { rows: paperRows(1708) },
        [EPSON.color]: { rows: paperRows(240) },
      }),
      1705,
    );

    expect(counts).toMatchObject({ monoCount: 1468, colorCount: 240 });
  });

  it('表が途中で切れたら読まない', async () => {
    // 足りない行を 0 として足すと、その用紙サイズのぶんだけ少なく出る
    const counts = await epsonCounts(
      fakeSession({
        [EPSON.total]: { rows: paperRows(1708) },
        [EPSON.color]: { rows: paperRows(240), cutAfter: 3 },
      }),
      1708,
    );

    expect(counts).toBeNull();
  });
});
