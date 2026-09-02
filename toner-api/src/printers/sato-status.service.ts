import { Injectable, Logger } from '@nestjs/common';
import * as net from 'node:net';

/**
 * SATO ラベルプリンターのステータス返送（ENQ 応答）。
 *
 * **この機種は SNMP を持たない。** レスプリ V/V-ex の取扱説明書・設定ツール説明書
 * どちらにも SNMP の記載が無く、実機も応答しない。代わりに公式仕様として
 * 「ステータス返送機能」があり、ソケットに ENQ を 1 バイト送ると状態が返る。
 *
 * 仕様の出どころ:
 * - Multi LABELIST Component リファレンスマニュアル（サトー・日本語）ステータス一覧
 * - CL4NX Plus Programming Reference（英語）Return status
 *
 * **取れるのは「状態」だけ。** リボン切れ・用紙切れ・ニアエンドは分かるが、
 * 累計印刷枚数は返らない（6 桁の欄は「印刷中のジョブの残り枚数」で、
 * 印刷していないときは 0 で埋まる）。枚数は SNMP を持つ HC4-LX 側の話。
 */

/** ステータス要求。スタンダードコード時の ENQ */
const ENQ = 0x05;
const STX = 0x02;
const ETX = 0x03;

/**
 * ステータス返送に使うポート。
 * 1 ポート接続（ステータス3）のとき、印字データの受信と兼用になる。
 * 実機は 1024/1025 が閉じていて 9100 だけが開いていた
 */
export const SATO_STATUS_PORT = 9100;

/** 応答を待つ時間。無応答の機器で長く待ちすぎない */
const TIMEOUT_MS = 5000;

/** 状態の重み。画面で色を分けるのと、警告として残すかの判断に使う */
export type SatoStatusKind = 'ok' | 'warn' | 'error';

type StatusInfo = {
  label: string;
  kind: SatoStatusKind;
  /** リボン・ラベルの残りが少ない状態か。消耗品の補充の合図になる */
  nearEnd?: boolean;
};

/**
 * ステータスコード表。ASCII 1 文字で返る。
 *
 * 大文字が通常状態（オフライン・印字中・待機）、小文字がエラー検出。
 * 表そのものは上記 2 つの公式資料に載っており、日本語版と英語版で一致している
 */
const STATUS: Record<string, StatusInfo> = {
  // ── 通常状態 ──
  A: { label: 'エラーなし（印字停止中）', kind: 'ok' },
  B: { label: 'リボン／ラベルニアエンド', kind: 'warn', nearEnd: true },
  C: { label: '受信バッファニアフル', kind: 'warn' },
  D: {
    label: 'リボン／ラベルニアエンド＆バッファニアフル',
    kind: 'warn',
    nearEnd: true,
  },
  E: { label: '受信待ち', kind: 'ok' },
  G: { label: 'エラーなし（印字中）', kind: 'ok' },
  H: {
    label: 'リボン／ラベルニアエンド（印字中）',
    kind: 'warn',
    nearEnd: true,
  },
  I: { label: '受信バッファニアフル（印字中）', kind: 'warn' },
  J: {
    label: 'リボン／ラベルニアエンド＆バッファニアフル（印字中）',
    kind: 'warn',
    nearEnd: true,
  },
  K: { label: '印字中', kind: 'ok' },
  Q: { label: '待機中（ハクリ・カット待ち）', kind: 'ok' },
  V: {
    label: 'リボン／ラベルニアエンド＆バッファニアフル',
    kind: 'warn',
    nearEnd: true,
  },
  W: { label: '解析・編集中', kind: 'ok' },

  // ── エラー検出（オフライン状態）──
  a: { label: '受信バッファフル', kind: 'error' },
  b: { label: 'ヘッドオープン', kind: 'error' },
  c: { label: 'ペーパーエンド（用紙切れ）', kind: 'error' },
  d: { label: 'リボンエンド（リボン切れ）', kind: 'error' },
  e: { label: 'メディアエラー（印字エラー）', kind: 'error' },
  f: { label: 'センサエラー・紙詰まり', kind: 'error' },
  g: { label: 'ヘッド異常', kind: 'error' },
  h: { label: 'カバーオープン・カッターオープン', kind: 'error' },
  i: { label: 'カードエラー', kind: 'error' },
  j: { label: 'カッターエラー', kind: 'error' },
  k: { label: 'その他のエラー', kind: 'error' },
  m: { label: 'スタッカー／リワインダフル', kind: 'error' },
  o: { label: 'RFID タグエラー', kind: 'error' },
  p: { label: 'RFID プロテクトエラー', kind: 'error' },
};

/** 応答が返らない・読めないとき。SNMP 側の SnmpUnreachableError と同じ役回り */
export class SatoUnreachableError extends Error {}

export type SatoStatusSnapshot = {
  /** 返ってきた生のステータス文字（1 文字）。表に無い値の切り分け用に持つ */
  code: string;
  label: string;
  kind: SatoStatusKind;
  nearEnd: boolean;
  /** ジョブ ID。<ID> コマンドの指定が無ければ空白が返る */
  jobId: string;
  /**
   * 印刷中のジョブの残りラベル枚数。
   * **累計ではない。** 印刷していないときは 0
   */
  remaining: number;
  /** 応答の生バイト（16 進）。仕様と食い違ったときの手がかりに残す */
  raw: string;
};

/**
 * 応答から STX〜ETX を取り出して読む。
 *
 * 11 バイト（STX + ID2 + 状態1 + 残数6 + ETX）が基本。
 * ポート3 の Legacy Status 設定が有効だと先頭に Size が付いて 15 バイトになるので、
 * 長さで決め打ちせず STX と ETX の位置で切り出す
 */
export function parseSatoStatus(buffer: Buffer): SatoStatusSnapshot {
  const start = buffer.indexOf(STX);
  const end = buffer.indexOf(ETX, start + 1);

  if (start < 0 || end < 0 || end - start < 10) {
    throw new SatoUnreachableError(
      `ステータスの形式が仕様と違います（受信: ${buffer.toString('hex')}）`,
    );
  }

  const body = buffer.subarray(start + 1, end);
  const jobId = body.subarray(0, 2).toString('latin1');
  const code = body.subarray(2, 3).toString('latin1');
  const remaining = Number.parseInt(body.subarray(3, 9).toString('latin1'), 10);

  const info = STATUS[code] ?? {
    label: `不明なステータス（コード ${code}）`,
    kind: 'error' as const,
  };

  return {
    code,
    label: info.label,
    kind: info.kind,
    nearEnd: info.nearEnd === true,
    jobId: jobId.trim(),
    remaining: Number.isNaN(remaining) ? 0 : remaining,
    raw: buffer.toString('hex'),
  };
}

@Injectable()
export class SatoStatusService {
  private readonly logger = new Logger(SatoStatusService.name);

  /**
   * 1 台に問い合わせる。
   *
   * **印刷データを送っている最中に ENQ を送ってはいけない**と公式資料にある
   * （ステータスが正しく返らず、印刷も乱れる）。こちらからは印刷しないので、
   * 他のホストが印刷している最中に当たる可能性だけが残る。
   * その場合でも送るのは ENQ 1 バイトで、ラベルは出ない
   */
  async poll(
    ipAddress: string,
    port = SATO_STATUS_PORT,
  ): Promise<SatoStatusSnapshot> {
    const buffer = await this.request(ipAddress, port);
    return parseSatoStatus(buffer);
  }

  /** ソケットを開いて ENQ を 1 バイト送り、ETX まで読む */
  private request(ipAddress: string, port: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const chunks: Buffer[] = [];
      let settled = false;

      const finish = (error: Error | null, data?: Buffer) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        if (error) reject(error);
        else resolve(data as Buffer);
      };

      socket.setTimeout(TIMEOUT_MS);

      socket.on('timeout', () =>
        finish(
          new SatoUnreachableError(
            `${ipAddress}:${port} から応答がありません。電源・LAN・通信プロトコルの設定（ステータス返送）を確認してください`,
          ),
        ),
      );

      socket.on('error', (error) =>
        finish(
          new SatoUnreachableError(
            `${ipAddress}:${port} へ接続できません（${error.message}）`,
          ),
        ),
      );

      socket.on('data', (chunk) => {
        chunks.push(chunk);
        const all = Buffer.concat(chunks);
        // ETX まで来たら 1 件ぶん揃っている
        if (all.includes(ETX)) finish(null, all);
      });

      socket.on('close', () => {
        const all = Buffer.concat(chunks);
        finish(
          all.length > 0
            ? null
            : new SatoUnreachableError(
                `${ipAddress}:${port} が応答を返さずに切断しました`,
              ),
          all,
        );
      });

      socket.connect(port, ipAddress, () => {
        this.logger.debug(`${ipAddress}:${port} へ ENQ を送信`);
        socket.write(Buffer.from([ENQ]));
      });
    });
  }
}
