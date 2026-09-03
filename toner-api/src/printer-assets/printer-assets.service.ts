import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { fromDate, toDate, today } from '../common/date';
import { toText } from '../common/text';
import { makerKey } from '../maint-vendors/maint-vendors.service';
import { indexPrinters, matchPrinter } from '../printers/printer-match';
import { CONSUMABLE_TYPES } from '../printers/supply-types';
import { PrintersService } from '../printers/printers.service';
import { CreatePrinterAssetDto } from './dto/create-printer-asset.dto';

/** 画面に出すのは会社名と連絡先だけ。既定のメーカー一覧までは要らない */
function toVendor(vendor: VendorSlice) {
  return { id: vendor.id, name: vendor.name, phones: vendor.phones };
}

/**
 * 機能ごとの累計を、モノクロとカラーを足して出す。
 * **両方とも取れていないときだけ null**（0 枚と区別する）。
 * 数え方は page-counts 側と揃えてある
 */
function sumCounts(mono: number | null, color: number | null): number | null {
  if (mono === null && color === null) return null;
  return (mono ?? 0) + (color ?? 0);
}

/**
 * 機種をまとめる鍵。メーカーと型番の**表記ゆれを畳む**。
 * 台帳には手入力で 'Ricoh P501' と 'Ricoh P 501' の両方が入っており、
 * そのまま比べると同じ機種が 2 つに割れる。
 * 全角・半角（NFKC）、大文字小文字、空白と区切り記号を落として比べる。
 * 元の表記は variants で返すので、どちらの書き方が混じっているかは画面で分かる
 */
function modelKey(maker: string | null, model: string | null): string {
  const fold = (value: string | null) =>
    (value ?? '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\s\-_・]/g, '');
  // 区切りは \0。入力に現れない文字なので、メーカーと型番の境目が動かない
  return `${fold(maker)}\0${fold(model)}`;
}

/** 色の並び。機種によって返る順がばらつくので、返すときはこの順に揃える */
const COLOR_ORDER = ['black', 'cyan', 'magenta', 'yellow'];

/*
 * 機種の色数は、印刷に使う消耗品（CONSUMABLE_TYPES）だけで数える。
 * ドラムや廃トナーは色を持っていても数えない。カラー機はドラムを色ごとに
 * 持つので、混ぜるとモノクロ機と見分けが付かなくなる
 */

/**
 * 名前から色を拾うための対応表。
 * prtMarkerColorant を返さない機種があり、そのときは名前だけが手がかりになる
 */
const NAME_COLOR: [RegExp, string][] = [
  [/black|ブラック|黒/i, 'black'],
  [/cyan|シアン/i, 'cyan'],
  [/magenta|マゼンタ/i, 'magenta'],
  [/yellow|イエロー/i, 'yellow'],
];

/** トナーマスタの色の呼び名 → 色。4色パックのように 1 件で複数を指すものもある */
const TONER_COLOR: [RegExp, string[]][] = [
  [/4色|フルカラー/, ['black', 'cyan', 'magenta', 'yellow']],
  [/ブラック|黒/, ['black']],
  [/シアン/, ['cyan']],
  [/マゼンタ/, ['magenta']],
  [/イエロー/, ['yellow']],
];

/** 実機が返した消耗品 1 件の色。機器が色を返さないときは名前から拾う */
function supplyColor(supply: {
  colorant: string | null;
  name: string;
}): string | null {
  const direct = supply.colorant?.toLowerCase();
  if (direct && COLOR_ORDER.includes(direct)) return direct;
  for (const [pattern, color] of NAME_COLOR) {
    if (pattern.test(supply.name)) return color;
  }
  return null;
}

/** トナーマスタの色欄から色を拾う。ライトシアンなどは元の色に寄せる */
function tonerColors(color: string | null): string[] {
  if (!color) return [];
  for (const [pattern, colors] of TONER_COLOR) {
    if (pattern.test(color)) return colors;
  }
  return [];
}

/** 修理履歴のうち、一覧の集計に要る分だけ */
type RepairSlice = {
  printerAssetId: number;
  handledBy: 'IN_HOUSE' | 'VENDOR';
  /** 復旧日。任意なので、無いときは発生日で期間を判定する */
  restoredOn: Date | null;
  /** 発生日。復旧日が無いときの判定に使う */
  occurredOn: Date | null;
  /** かかった費用（円）。未入力のものは合計に足さない */
  cost: number | null;
  status: string;
};

/**
 * その修理を保守期間の中の出来事として数えるかどうか。
 *
 * 見るのは**復旧日、無ければ発生日**。復旧日は任意なので、
 * 復旧日だけで判定すると「完了しているのに 1 件も数えられない」履歴が出る。
 * どちらも無いものは時期が決まらないので数えない。
 *
 * 開始・終了は入っている側だけを見る（片方だけの台帳があるため）。
 * どちらも無い台帳は期間が決まらないので、呼ぶ側で数えない
 */
function withinMaint(
  repair: Pick<RepairSlice, 'restoredOn' | 'occurredOn'>,
  start: Date | null,
  end: Date | null,
): boolean {
  const when = repair.restoredOn ?? repair.occurredOn;
  if (!when) return false;
  if (start && when < start) return false;
  if (end && when > end) return false;
  return true;
}

/** 保守業者のうち、台帳から見て要る分だけ */
type VendorSlice = {
  id: number;
  name: string;
  phones: string[];
  makers: string[];
};

/**
 * そのトナーを使っているプリンター 1 台。
 *
 * **機種の枠を越えて集める。** 同じトナーを別の機種でも使うことがあり
 * （C310H は SP C320・C341・C342 の 3 機種）、その台まで見えないと
 * 「この品番を切らすとどこが止まるか」が分からないため
 */
type TonerPrinter = {
  id: number;
  /** プリンター名。台帳のメーカー＋型番 */
  name: string | null;
  department: string | null;
  no: string | null;
  ipAddress: string | null;
  /** 今見ている機種の台か。false なら同じトナーを使う別機種の台 */
  sameModel: boolean;
};

/** 機種別の一覧に出すトナー 1 件 */
type ModelToner = {
  id: string;
  name: string | null;
  color: string | null;
  recycled: boolean;
  alertThreshold: number | null;
  /** 今日の時点で有効な税別価格。登録が無ければ null */
  price: number | null;
  stock: number;
  /** その機種のうち、このトナーを紐づけている台数 */
  assetCount: number;
  /** このトナーを使っている台。同じ機種のものを先に並べる */
  printers: TonerPrinter[];
};

/** 機種をまとめている途中の入れ物。返す前に配列へ均す */
type ModelGroup = {
  key: string;
  maker: string | null;
  model: string | null;
  /** 台帳での書き方 → その書き方の台数 */
  spellings: Map<string, number>;
  toners: Map<string, ModelToner>;
  /** 実機が返した消耗品の色 */
  printerColors: Set<string>;
  /** 紐づけているトナーの色。実機から取れないときの代わり */
  tonerColors: Set<string>;
  /** 消耗品を取得できている台数 */
  polled: number;
  assets: {
    id: number;
    department: string | null;
    no: string | null;
    ipAddress: string | null;
    maker: string | null;
    model: string | null;
    serialNumber: string | null;
    tonerIds: string[];
  }[];
};

/**
 * 取り直しで実機のシリアルを台帳へ書き戻した結果。
 * 書くことが無かったとき（台帳に既にある / 実機が返さない）は null。
 * taken は「そのシリアルを持つ台帳が他にある」で、書かずに知らせるだけ
 */
export type SerialFill =
  | { status: 'filled'; serialNumber: string }
  | {
      status: 'taken';
      serialNumber: string;
      assetId: number;
      department: string | null;
      no: string | null;
    }
  | null;

type AssetRow = {
  id: number;
  /** 持っている会社。全社表示の画面はこれを列に出す */
  companyId: number;
  company?: { id: number; name: string } | null;
  maintVendor?: VendorSlice | null;
  department: string | null;
  no: string | null;
  ipAddress: string | null;
  maker: string | null;
  model: string | null;
  serialNumber: string | null;
  purchasedOn: Date | null;
  purchasePrice: number | null;
  contractNo: string | null;
  maintVendorId: number | null;
  maintContract: string | null;
  maintStartOn: Date | null;
  maintEndOn: Date | null;
  maintDealOn: Date | null;
  maintFee: number | null;
  note: string | null;
  countLayout: 'TOTAL' | 'MONO_COLOR' | 'COLOR_MONO';
  /** 無効にした日時。null なら有効 */
  disabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrinterAssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly printers: PrintersService,
  ) {}

  async create(dto: CreatePrinterAssetDto) {
    const saved = await this.prisma.printerAsset.create({
      data: this.toData(dto),
      include: { maintVendor: true, company: true },
    });
    return this.toResponse(saved, await this.vendorsByMaker());
  }

  /**
   * 台帳の一覧。**既定では無効にした台を返さない。**
   *
   * 修理履歴・トナー登録・保守登録の選択肢はどれもここから作られるので、
   * ここで外しておけば「使っていない機器を選べてしまう」場所が残らない。
   * 無効の分まで要るのはプリンター登録の画面だけで、そこだけ true を渡す
   */
  async findAll(includeDisabled = false, companyId?: number) {
    const assets = await this.prisma.printerAsset.findMany({
      where: {
        ...(includeDisabled ? {} : { disabledAt: null }),
        ...(companyId ? { companyId } : {}),
      },
      orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
      include: { maintVendor: true, company: true },
    });
    const byMaker = await this.vendorsByMaker();
    return assets.map((asset) => this.toResponse(asset, byMaker));
  }

  /**
   * 台帳を主にして、実機の情報と直近の印刷枚数をぶら下げて返す。
   *
   * 台帳と機器は別のテーブルで外部キーも無いので、読むたびに突き合わせる
   * （突き合わせ方は printer-match）。
   * 取れないものは null で返す。画面はそれを空欄として出す。
   */
  async findOverview() {
    const [assets, printers, dailies, repairs, byMaker] = await Promise.all([
      // 無効にした台は出さない。今動いている機器を見る画面なので
      this.prisma.printerAsset.findMany({
        where: { disabledAt: null },
        orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
        include: { maintVendor: true, company: true },
      }),
      this.prisma.printer.findMany({
        include: {
          readings: { orderBy: { supplyIndex: 'asc' } },
          alerts: { orderBy: { alertIndex: 'asc' } },
        },
      }),
      /*
       * 機器ごとの最新 1 件だけ要る。**絞り込みは DB 側で行う。**
       * 日次の記録は 1 台につき 1 日 1 行ずつ増え続けるので、全期間を読んで
       * 最新以外を捨てる形だと、運用した日数に比例して重くなる
       */
      this.prisma.pageCountDaily.findMany({
        distinct: ['printerId'],
        orderBy: [{ printerId: 'asc' }, { date: 'desc' }],
      }),
      // 修理は台帳に紐づくので、台帳ごとに数え直す
      this.prisma.repairRecord.findMany({
        select: {
          printerAssetId: true,
          handledBy: true,
          restoredOn: true,
          occurredOn: true,
          cost: true,
          status: true,
        },
      }),
      this.vendorsByMaker(),
    ]);

    const live = indexPrinters(printers, assets);
    const latest = new Map(dailies.map((row) => [row.printerId, row]));

    const repairsByAsset = new Map<number, RepairSlice[]>();
    for (const repair of repairs) {
      const list = repairsByAsset.get(repair.printerAssetId) ?? [];
      list.push(repair);
      repairsByAsset.set(repair.printerAssetId, list);
    }

    return assets.map((asset) => {
      const printer = matchPrinter(asset, live);
      const daily = printer ? (latest.get(printer.id) ?? null) : null;

      return {
        ...this.toResponse(asset, byMaker),
        repairs: this.countRepairs(asset, repairsByAsset.get(asset.id) ?? []),
        printer: printer
          ? {
              id: printer.id,
              ipAddress: printer.ipAddress,
              /** 読み方。SATO_ENQ は画面から手で読む機器 */
              protocol: printer.protocol,
              hostName: printer.hostName,
              model: printer.model,
              serialNumber: printer.serialNumber,
              macAddress: printer.macAddress,
              pageCount: printer.pageCount,
              /** pageCount の単位。17 はメートル（ラベルプリンター）で枚ではない */
              counterUnit: printer.counterUnit,
              reachable: printer.reachable,
              lastError: printer.lastError,
              lastPolledAt: printer.lastPolledAt,
              lastSuccessAt: printer.lastSuccessAt,
              consoleText: printer.consoleText,
              readings: printer.readings.map((r) => ({
                id: r.id,
                supplyIndex: r.supplyIndex,
                name: r.name,
                supplyType: r.supplyType,
                supplyClass: r.supplyClass,
                colorant: r.colorant,
                level: r.level,
                maxCapacity: r.maxCapacity,
                percent: r.percent,
              })),
              alerts: printer.alerts.map((a) => ({
                id: a.id,
                alertIndex: a.alertIndex,
                severity: a.severity,
                alertGroup: a.alertGroup,
                groupIndex: a.groupIndex,
                code: a.code,
                description: a.description,
              })),
            }
          : null,
        latest: daily
          ? {
              date: fromDate(daily.date),
              pages: daily.pages,
              monoPages: daily.monoPages,
              colorPages: daily.colorPages,
              total: daily.total,
              totalMono: daily.totalMono,
              totalColor: daily.totalColor,
              /**
               * 機能ごとの累計。**機能 × 色の内訳を足して出す。**
               * 出さない機種・機能は null（0 と区別する）。
               * スキャナは紙に出ないので total には入っていない
               */
              totalPrint: sumCounts(
                daily.totalPrintMono,
                daily.totalPrintColor,
              ),
              totalCopy: sumCounts(daily.totalCopyMono, daily.totalCopyColor),
              totalScan: sumCounts(daily.totalScanMono, daily.totalScanColor),
            }
          : null,
      };
    });
  }

  /**
   * 台帳を機種（メーカー＋型番）でまとめ、その機種で使うトナーを添えて返す。
   *
   * トナーの紐づけは台帳の 1 台ずつに付いているので、同じ機種が何台もあると
   * 「トナー登録」の一覧では同じ機種が何度も出てくる。ここでは機種を 1 行にして、
   * その機種のどれかに紐づいているトナーをまとめて出す。
   *
   * **同じ機種でも台ごとに紐づけが違うことがある**（1 台だけ登録し忘れているなど）。
   * まとめると差が見えなくなるので、台ごとの紐づけも assets に残し、
   * 揃っていない機種は mixed で示す。
   *
   * **会社ごとに見る画面（トナー個数状況）から呼ばれる。** 機種も在庫も
   * その会社の分だけを数える。品番マスタは全社共通なので、
   * 在庫は「品番 × 会社」の行から取り出す
   */
  async findByModel(companyId: number) {
    const [assets, printers] = await Promise.all([
      // 無効にした台は数えない。機種ごとの台数が実態と合わなくなる
      this.prisma.printerAsset.findMany({
        where: { disabledAt: null, companyId },
        orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          department: true,
          no: true,
          ipAddress: true,
          maker: true,
          model: true,
          serialNumber: true,
          toners: {
            select: {
              toner: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  recycled: true,
                  alertThreshold: true,
                  // 在庫は「品番 × 会社」。この会社の行だけを取り出す
                  stocks: {
                    where: { companyId },
                    select: { quantity: true },
                  },
                  prices: {
                    orderBy: { effectiveFrom: 'desc' },
                    select: { price: true, effectiveFrom: true },
                  },
                },
              },
            },
          },
        },
      }),
      // 機種が何色機かは、実機が返す消耗品の色で判定する
      this.prisma.printer.findMany({
        select: {
          ipAddress: true,
          serialNumber: true,
          readings: {
            select: { name: true, colorant: true, supplyType: true },
          },
        },
      }),
    ]);

    const live = indexPrinters(printers, assets);
    const now = today();
    const groups = new Map<string, ModelGroup>();

    /*
     * 品番 → その品番を使っている台。**機種でまとめる前に、台帳の全件から作る。**
     * 機種の中だけで集めると、同じトナーを使う別機種の台が見えなくなる
     */
    const usersByToner = new Map<string, (TonerPrinter & { key: string })[]>();
    for (const asset of assets) {
      const user = {
        id: asset.id,
        name: [asset.maker, asset.model].filter(Boolean).join(' ') || null,
        department: asset.department,
        no: asset.no,
        ipAddress: asset.ipAddress,
        key: modelKey(asset.maker, asset.model),
        sameModel: false,
      };
      for (const { toner } of asset.toners) {
        const list = usersByToner.get(toner.id) ?? [];
        list.push(user);
        usersByToner.set(toner.id, list);
      }
    }

    /** その品番を使っている台。今見ている機種のぶんを先に並べる */
    const printersOf = (tonerId: string, key: string): TonerPrinter[] =>
      (usersByToner.get(tonerId) ?? [])
        .map(({ key: owner, ...user }) => ({
          ...user,
          sameModel: owner === key,
        }))
        .sort((a, b) => Number(b.sameModel) - Number(a.sameModel));

    for (const asset of assets) {
      const key = modelKey(asset.maker, asset.model);
      const group = groups.get(key) ?? {
        key,
        maker: asset.maker,
        model: asset.model,
        spellings: new Map<string, number>(),
        toners: new Map<string, ModelToner>(),
        assets: [],
        printerColors: new Set<string>(),
        tonerColors: new Set<string>(),
        polled: 0,
      };

      const spelling = [asset.maker, asset.model].filter(Boolean).join(' ');
      group.spellings.set(spelling, (group.spellings.get(spelling) ?? 0) + 1);

      // 実機が返した消耗品の色。トナー・インクだけを見る（ドラムは色を持っていても数えない）
      const printer = matchPrinter(asset, live);
      const supplies = (printer?.readings ?? []).filter(
        (supply) =>
          supply.supplyType === null ||
          CONSUMABLE_TYPES.includes(supply.supplyType),
      );
      if (supplies.length > 0) group.polled += 1;
      for (const supply of supplies) {
        const color = supplyColor(supply);
        if (color) group.printerColors.add(color);
      }

      for (const { toner } of asset.toners) {
        // 実機から色が取れない機種の代わりになる、紐づけたトナー側の色
        for (const color of tonerColors(toner.color))
          group.tonerColors.add(color);

        const known = group.toners.get(toner.id);
        if (known) {
          known.assetCount += 1;
          continue;
        }

        // 今日の時点で有効な価格。履歴は新しい順に入っている
        const current = toner.prices.find((row) => row.effectiveFrom <= now);
        group.toners.set(toner.id, {
          id: toner.id,
          name: toner.name,
          color: toner.color,
          recycled: toner.recycled,
          alertThreshold: toner.alertThreshold,
          price: current?.price ?? null,
          // 会社で絞ってあるので 0 件か 1 件。行が無ければ在庫 0
          stock: toner.stocks[0]?.quantity ?? 0,
          /** その機種のうち、このトナーを紐づけている台数 */
          assetCount: 1,
          /** このトナーを使っている台。他機種の台も含む */
          printers: printersOf(toner.id, key),
        });
      }

      group.assets.push({
        id: asset.id,
        department: asset.department,
        no: asset.no,
        ipAddress: asset.ipAddress,
        maker: asset.maker,
        model: asset.model,
        serialNumber: asset.serialNumber,
        tonerIds: asset.toners.map((link) => link.toner.id).sort(),
      });

      groups.set(key, group);
    }

    return [...groups.values()]
      .map((group) => {
        // 代表の表記は、その機種でいちばん多く使われている書き方にする
        const spellings = [...group.spellings.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([text]) => text);
        const signatures = new Set(
          group.assets.map((asset) => asset.tonerIds.join(',')),
        );

        /*
         * 何色機か。実機が返した消耗品の色を優先し、1 台も取れていない機種では
         * 紐づけているトナーの色で代える。どちらも無ければ分からないままにする
         */
        const fromPrinter = group.printerColors.size > 0;
        const found = fromPrinter ? group.printerColors : group.tonerColors;
        const colors = COLOR_ORDER.filter((color) => found.has(color));

        return {
          key: group.key,
          maker: group.maker,
          model: group.model,
          /** 台帳に入っている実際の表記。2 つ以上あれば書き方が揺れている */
          spellings,
          assetCount: group.assets.length,
          /** そのうちトナーを 1 件でも紐づけている台数 */
          linkedCount: group.assets.filter((a) => a.tonerIds.length > 0).length,
          /** 同じ機種なのに台ごとに紐づけが違うか */
          mixed: signatures.size > 1,
          /**
           * その機種が使う色。K C M Y の順。
           * source が 'printer' なら実機が返した消耗品から、'toner' なら
           * 登録してあるトナーの色から出したもの。分からないときは空配列で source は null
           */
          colors,
          colorSource:
            colors.length === 0 ? null : fromPrinter ? 'printer' : 'toner',
          /** 消耗品を取得できている台数。色の確からしさの目安 */
          polled: group.polled,
          toners: [...group.toners.values()].sort((a, b) =>
            a.id.localeCompare(b.id, 'ja', { numeric: true }),
          ),
          assets: group.assets,
        };
      })
      .sort(
        (a, b) =>
          (a.maker ?? '').localeCompare(b.maker ?? '', 'ja') ||
          (a.model ?? '').localeCompare(b.model ?? '', 'ja', { numeric: true }),
      );
  }

  async findOne(id: number) {
    const asset = await this.prisma.printerAsset.findUnique({
      where: { id },
      include: { maintVendor: true, company: true },
    });
    if (!asset) {
      throw new NotFoundException(`ID ${id} の端末情報は登録されていません`);
    }
    return this.toResponse(asset, await this.vendorsByMaker());
  }

  async update(id: number, dto: CreatePrinterAssetDto) {
    await this.ensureExists(id);

    const saved = await this.prisma.printerAsset.update({
      where: { id },
      data: this.toData(dto),
      include: { maintVendor: true, company: true },
    });
    return this.toResponse(saved, await this.vendorsByMaker());
  }

  /**
   * その台帳の IP に SNMP で問い合わせ、実機の情報を取り直す。
   *
   * 一覧の「更新」ボタン用。実機マスタ（printers）を IP で upsert し、
   * 併せて台帳の更新日も進める（実機を見て台帳を確かめた、という記録）。
   *
   * IP が未入力の台帳は問い合わせ先が無いので、更新日だけ進めて
   * status: 'no-ip' を返す。応答が無かった場合も台帳の更新日は進める
   * （確認しに行った事実は残るため）。
   *
   * 取れたシリアルは台帳が空のときだけ書き戻す（fillSerial）。
   * 以降の突き合わせが IP ではなくシリアルで通るようになり、
   * IP を振り直しても台帳と実機が離れない
   */
  async refresh(id: number) {
    const asset = await this.findOne(id);

    if (!asset.ipAddress) {
      await this.touch(id);
      return {
        id,
        ipAddress: null,
        status: 'no-ip' as const,
        message: 'IP アドレスが未入力なので実機に問い合わせできません',
        printer: null,
        serial: null,
      };
    }

    try {
      const printer = await this.printers.create({
        ipAddress: asset.ipAddress,
      });
      const serial = await this.fillSerial(
        id,
        asset.serialNumber,
        printer.serialNumber,
      );
      await this.touch(id);
      return {
        id,
        ipAddress: asset.ipAddress,
        status: 'ok' as const,
        message: null,
        printer,
        serial,
      };
    } catch (error) {
      // 応答が無くても台帳の確認記録は残す。前回取れた実機の情報も消さない
      await this.touch(id);
      return {
        id,
        ipAddress: asset.ipAddress,
        status: 'unreachable' as const,
        message: error instanceof Error ? error.message : '応答がありません',
        printer: null,
        serial: null,
      };
    }
  }

  /**
   * 中身は変えず、更新日だけを現在時刻に進める。
   * 実機を見に行って台帳が正しいことを確かめた、という記録をこの日時で残す。
   */
  async touch(id: number) {
    await this.ensureExists(id);

    const saved = await this.prisma.printerAsset.update({
      where: { id },
      data: { updatedAt: new Date() },
      include: { maintVendor: true, company: true },
    });
    return this.toResponse(saved, await this.vendorsByMaker());
  }

  /**
   * 使わなくなった台を無効にする／元に戻す。**普段はこちらを使う。**
   *
   * 台帳を消すと、その機器の修理履歴が道連れで消える（onDelete: Cascade）。
   * トナーの紐づけも同じ。入れ替えた機器の履歴は残しておきたいので、
   * 消さずに印を付けて一覧と選択肢から外す。
   *
   * **止める条件は設けない。** 在庫や履歴があっても無効にしてよい。
   * いつでも元に戻せるので、間違えても失うものが無い。
   * 更新日は動かさない（実機を見て確かめた記録という意味を持たせているため）
   */
  async setDisabled(id: number, disabled: boolean) {
    await this.ensureExists(id);

    const saved = await this.prisma.printerAsset.update({
      where: { id },
      data: { disabledAt: disabled ? new Date() : null },
      include: { maintVendor: true, company: true },
    });
    return this.toResponse(saved, await this.vendorsByMaker());
  }

  /**
   * 台帳から完全に消す。**無効にしたものだけ、修理履歴が無いときだけ。**
   *
   * 無効（`disabledAt`）が普段の止め方で、こちらは登録し間違えた行の後始末。
   *
   * **修理履歴は外部キーが Cascade なので、止めないと黙って道連れで消える。**
   * DB は拒否してくれないので、ここで数えて断るしかない。
   * 機器を入れ替えたのなら消さずに無効のままにする（履歴は台に紐づく記録で、
   * 台帳の行が消えると何を直したのかを辿れなくなる）。
   *
   * トナーの紐づけは道連れで消えてよい。どのトナーを使う台かという対応表で、
   * 台が無くなれば意味を持たない。トナーのマスタ自体は残る
   */
  async remove(id: number) {
    const asset = await this.prisma.printerAsset.findUnique({
      where: { id },
      select: {
        id: true,
        no: true,
        department: true,
        model: true,
        serialNumber: true,
        disabledAt: true,
        _count: { select: { repairs: true, toners: true } },
      },
    });

    if (!asset) {
      throw new NotFoundException(`ID ${id} の機器は登録されていません`);
    }

    const label = [
      asset.no ? `No.${asset.no}` : null,
      asset.department,
      asset.model,
    ]
      .filter(Boolean)
      .join(' / ');

    // 先に無効にしてもらう。一覧から消えた状態を見てから消す 2 段構えにする
    if (asset.disabledAt === null) {
      throw new BadRequestException(
        `${label} はまだ有効です。先に無効にしてから削除してください`,
      );
    }

    if (asset._count.repairs > 0) {
      throw new BadRequestException(
        `${label} には修理履歴が ${asset._count.repairs} 件あり、削除すると一緒に消えます。` +
          '無効のままにしておけば、一覧と選択肢からは外れたまま履歴が残ります',
      );
    }

    await this.prisma.printerAsset.delete({ where: { id } });

    return {
      id,
      deleted: true,
      /** 道連れで消えたもの。何が無くなったかを画面で知らせる */
      removed: { toners: asset._count.toners },
    };
  }

  // ── 内部ヘルパー ──────────────────────

  /**
   * 実機から読めたシリアルを台帳へ書き戻す。書いたかどうかを返す。
   *
   * **台帳のシリアルが空のときだけ書く。** 入っている値は実機と食い違っても
   * 上書きしない。台帳は手入力で、実機の側が交換後の別機になっていることも
   * あるため、どちらが正しいかは人が決める。
   *
   * **同じシリアルを既に別の台帳が持っているときも書かない。** 書くと 1 台の
   * 実機に台帳が 2 行ぶら下がり、突き合わせ（printer-match）はシリアルの索引に
   * 後勝ちで入ったほうしか拾わなくなる。どちらの台帳に情報が付くかが
   * 読み出し順で変わるので、書かずに知らせて人に直してもらう
   */
  private async fillSerial(
    id: number,
    current: string | null,
    fromPrinter: string | null,
  ): Promise<SerialFill> {
    const serialNumber = toText(fromPrinter);

    // 台帳に既にある / 実機がシリアルを返さない機種は、どちらも書くことがない
    if (toText(current) || !serialNumber) return null;

    const taken = await this.prisma.printerAsset.findFirst({
      where: {
        id: { not: id },
        // 大文字小文字の違いだけの重複も同じ 1 台とみなす
        serialNumber: { equals: serialNumber, mode: 'insensitive' },
      },
      select: { id: true, department: true, no: true },
      orderBy: { id: 'asc' },
    });

    if (taken) {
      return {
        status: 'taken',
        serialNumber,
        assetId: taken.id,
        department: taken.department,
        no: taken.no,
      };
    }

    await this.prisma.printerAsset.update({
      where: { id },
      data: { serialNumber },
    });
    return { status: 'filled', serialNumber };
  }

  /**
   * 台帳があることだけ確かめる。
   * 更新・削除の前置きなので、findOne のように 1 件を組み立て直さない
   * （組み立てには業者マスタの読み出しも要り、そのまま捨てることになる）
   */
  private async ensureExists(id: number) {
    const found = await this.prisma.printerAsset.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(`ID ${id} の端末情報は登録されていません`);
    }
  }

  /**
   * 台帳 1 台ぶんの修理の数え方。
   *
   * 回数は**復旧日（無ければ発生日）が保守期間に入っているものだけ**を数える。保守で見てもらった
   * ぶんと自分で直したぶんを、契約の期間で突き合わせられるようにするため。
   * 保守期間が入っていない台帳は「保守内」を決められないので hasMaint を false にして、
   * 画面ではハイフンを出す（0 回と区別する）。
   *
   * 対応中（open）は期間に関わらず数える。今その機器が使えるかどうかの話で、
   * 契約とは別だから。状態が空のものも「完了していない」として数える。
   *
   * 費用（cost）も保守期間内のぶんだけ合計する。保守金額（maintFee）と
   * 並べれば、その契約で何回・いくら見てもらったかが分かる。
   * 未入力は 0 円ではないので足さず、costKnown で何件入力済みかを添える
   */
  private countRepairs(
    asset: Pick<AssetRow, 'maintStartOn' | 'maintEndOn'>,
    repairs: RepairSlice[],
  ) {
    const inWindow = repairs.filter((repair) =>
      withinMaint(repair, asset.maintStartOn, asset.maintEndOn),
    );

    const withCost = inWindow.filter((r) => r.cost !== null);

    return {
      hasMaint: asset.maintStartOn !== null || asset.maintEndOn !== null,
      inHouse: inWindow.filter((r) => r.handledBy === 'IN_HOUSE').length,
      vendor: inWindow.filter((r) => r.handledBy === 'VENDOR').length,
      cost: withCost.reduce((sum, r) => sum + (r.cost ?? 0), 0),
      /** 保守内の履歴のうち、費用が入力されている件数 */
      costKnown: withCost.length,
      open: repairs.filter((r) => r.status !== 'DONE').length,
      total: repairs.length,
    };
  }

  private toData(dto: CreatePrinterAssetDto) {
    return {
      companyId: dto.companyId,
      department: toText(dto.department),
      no: toText(dto.no),
      ipAddress: toText(dto.ipAddress),
      maker: toText(dto.maker),
      model: toText(dto.model),
      serialNumber: toText(dto.serialNumber),
      purchasedOn: toDate(dto.purchasedOn),
      purchasePrice: dto.purchasePrice ?? null,
      contractNo: toText(dto.contractNo),
      maintVendorId: dto.maintVendorId ?? null,
      maintContract: toText(dto.maintContract),
      maintStartOn: toDate(dto.maintStartOn),
      maintEndOn: toDate(dto.maintEndOn),
      maintDealOn: toDate(dto.maintDealOn),
      maintFee: dto.maintFee ?? null,
      note: toText(dto.note),
      countLayout: dto.countLayout ?? 'TOTAL',
    };
  }

  /** メーカー名 → 既定の業者。表記ゆれを畳んだ鍵で引く */
  private async vendorsByMaker(): Promise<Map<string, VendorSlice>> {
    const vendors = await this.prisma.maintVendor.findMany({
      select: { id: true, name: true, phones: true, makers: true },
    });

    const byMaker = new Map<string, VendorSlice>();
    for (const vendor of vendors) {
      for (const maker of vendor.makers) byMaker.set(makerKey(maker), vendor);
    }
    return byMaker;
  }

  /**
   * その機器を実際に見ている業者。
   * 台帳の指定（上書き）が最優先で、無ければメーカーの既定に落ちる
   */
  private effectiveVendor(asset: AssetRow, byMaker: Map<string, VendorSlice>) {
    if (asset.maintVendor) {
      return { ...toVendor(asset.maintVendor), source: 'asset' as const };
    }
    const fallback = asset.maker ? byMaker.get(makerKey(asset.maker)) : null;
    return fallback
      ? { ...toVendor(fallback), source: 'maker' as const }
      : null;
  }

  private toResponse(asset: AssetRow, byMaker: Map<string, VendorSlice>) {
    return {
      id: asset.id,
      companyId: asset.companyId,
      /** 会社名。プリンター状況・修理など全社で見る画面の列になる */
      company: asset.company
        ? { id: asset.company.id, name: asset.company.name }
        : null,
      department: asset.department,
      no: asset.no,
      ipAddress: asset.ipAddress,
      maker: asset.maker,
      model: asset.model,
      serialNumber: asset.serialNumber,
      purchasedOn: fromDate(asset.purchasedOn),
      purchasePrice: asset.purchasePrice,
      contractNo: asset.contractNo,
      maintVendorId: asset.maintVendorId,
      /** 台帳で指定した業者。メーカー既定に任せているときは null */
      maintVendor: asset.maintVendor ? toVendor(asset.maintVendor) : null,
      /**
       * 実際に頼む先。台帳の指定があればそれ、無ければメーカーの既定。
       * source で「上書きしているのか、メーカー既定のままか」が分かる
       */
      effectiveVendor: this.effectiveVendor(asset, byMaker),
      maintContract: asset.maintContract,
      maintStartOn: fromDate(asset.maintStartOn),
      maintEndOn: fromDate(asset.maintEndOn),
      maintDealOn: fromDate(asset.maintDealOn),
      maintFee: asset.maintFee,
      note: asset.note,
      countLayout: asset.countLayout,
      /** 無効にした日時。null なら有効。画面はこれで一覧を 2 つに分ける */
      disabledAt: asset.disabledAt,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }
}
