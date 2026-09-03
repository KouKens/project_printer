import { Injectable } from '@nestjs/common';
import { fromDate, toDate } from '../common/date';
import { PrismaService } from '../prisma/prisma.service';
import { indexPrinters, matchPrinter } from '../printers/printer-match';

/**
 * 運用コストの算定。
 *
 * **カタログ値からの見積りと、実際に使ったぶんの 2 本立てで返す。**
 * 見たいのは両者の差なので、同じ期間・同じ分母（印刷枚数）で並べて返し、
 * 画面はそれを表に出すだけにする。
 *
 * 見積り側は「カタログの印刷可能枚数（Toner.yieldPages）」が分母。
 * 実績側はトナーの搬入・持ち出しの履歴が元になる。
 */

/** 日付の差を日数で。両端を含む（1 日だけ指定したら 1 日） */
function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
}

/** 1 年をこの日数として年額を日割りする */
const DAYS_PER_YEAR = 365;

/**
 * カラーのトナー・インクか。
 *
 * **黒とそれ以外を分ける。** モノクロ 1 枚では黒とドラム・廃トナーだけが減り、
 * カラー 1 枚ではさらに色が減る。全色を足して全枚数に掛けると、
 * モノクロばかり刷っている機器のトナー代を大きく見積もってしまう
 */
const COLOR_NAME = /シアン|マゼンタ|イエロー|カラー|4色|6色|フルカラー/;

function isColorSupply(color: string | null): boolean {
  if (!color) return false;
  // 「ブラック」は黒側。4 色パックのように色を含むものはカラー側
  if (/ブラック|黒/.test(color) && !COLOR_NAME.test(color)) return false;
  return COLOR_NAME.test(color);
}

/** 期間の指定。未指定なら枚数の記録がある全期間 */
export type CostQuery = {
  from?: string;
  to?: string;
  /** 本体を何年で償却するか */
  years?: number;
};

/** そのトナーの 1 枚あたり単価。価格と枚数の両方が要る */
type TonerCost = {
  id: string;
  name: string | null;
  color: string | null;
  price: number | null;
  yieldPages: number | null;
  costPerPage: number | null;
  isColor: boolean;
};

@Injectable()
export class CostsService {
  constructor(private readonly prisma: PrismaService) {}

  async find(query: CostQuery) {
    const years = query.years && query.years > 0 ? query.years : 5;

    const [assets, printers, dailies, repairs, toners, entries] =
      await Promise.all([
        this.prisma.printerAsset.findMany({
          orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            // 運用コストは全社まとめて見る。どこの機器かが分かるよう会社も引く
            company: { select: { id: true, name: true } },
            department: true,
            no: true,
            ipAddress: true,
            maker: true,
            model: true,
            serialNumber: true,
            purchasePrice: true,
            maintFee: true,
            maintStartOn: true,
            maintEndOn: true,
            toners: { select: { tonerId: true } },
          },
        }),
        this.prisma.printer.findMany({
          select: { id: true, ipAddress: true, serialNumber: true },
        }),
        this.prisma.pageCountDaily.findMany({
          orderBy: { date: 'asc' },
          select: {
            printerId: true,
            date: true,
            pages: true,
            monoPages: true,
            colorPages: true,
          },
        }),
        this.prisma.repairRecord.findMany({
          select: {
            printerAssetId: true,
            cost: true,
            restoredOn: true,
            occurredOn: true,
          },
        }),
        this.prisma.toner.findMany({
          select: {
            id: true,
            name: true,
            color: true,
            yieldPages: true,
            prices: {
              orderBy: { effectiveFrom: 'desc' },
              select: { price: true, effectiveFrom: true },
            },
            printers: { select: { printerAssetId: true } },
          },
        }),
        this.prisma.tonerEntry.findMany({
          orderBy: { createdAt: 'asc' },
          select: {
            tonerId: true,
            action: true,
            quantity: true,
            createdAt: true,
            receivedOn: true,
          },
        }),
      ]);

    // 期間。指定が無ければ枚数の記録がある範囲に合わせる
    const dates = dailies.map((row) => row.date);
    const first = dates.length > 0 ? dates[0] : new Date();
    const last = dates.length > 0 ? dates[dates.length - 1] : new Date();
    const from = query.from ? toDate(query.from) : first;
    const to = query.to ? toDate(query.to) : last;
    const days = Math.max(daysBetween(from, to), 1);
    /** 期間が 1 年に占める割合。年額を期間ぶんに割るのに使う */
    const share = days / DAYS_PER_YEAR;

    const now = new Date();
    const priceOf = (
      prices: { price: number; effectiveFrom: Date }[],
    ): number | null =>
      prices.find((row) => row.effectiveFrom <= now)?.price ?? null;

    // 品番 → 単価。カラーかどうかもここで決める
    const costs = new Map<string, TonerCost>();
    for (const toner of toners) {
      const price = priceOf(toner.prices);
      costs.set(toner.id, {
        id: toner.id,
        name: toner.name,
        color: toner.color,
        price,
        yieldPages: toner.yieldPages,
        costPerPage:
          price !== null && toner.yieldPages ? price / toner.yieldPages : null,
        isColor: isColorSupply(toner.color),
      });
    }

    // 台帳 → 実機。突き合わせ方は printer-match（他の一覧と同じ）
    const live = indexPrinters(printers, assets);

    // 実機ごとの期間内の枚数
    type Pages = { pages: number; color: number; splitPages: number };
    const pagesByPrinter = new Map<number, Pages>();
    for (const row of dailies) {
      if (row.date < from || row.date > to) continue;
      if (row.pages === null) continue;
      const cur = pagesByPrinter.get(row.printerId) ?? {
        pages: 0,
        color: 0,
        splitPages: 0,
      };
      cur.pages += row.pages;
      if (row.colorPages !== null) {
        cur.color += row.colorPages;
        cur.splitPages += row.pages;
      }
      pagesByPrinter.set(row.printerId, cur);
    }

    // 修理費。復旧日（無ければ発生日）が期間に入るものだけ数える
    const repairByAsset = new Map<number, { cost: number; known: number }>();
    for (const repair of repairs) {
      const when = repair.restoredOn ?? repair.occurredOn;
      if (!when || when < from || when > to) continue;
      const cur = repairByAsset.get(repair.printerAssetId) ?? {
        cost: 0,
        known: 0,
      };
      if (repair.cost !== null) {
        cur.cost += repair.cost;
        cur.known += 1;
      }
      repairByAsset.set(repair.printerAssetId, cur);
    }

    /*
     * 品番 → その品番を使っている唯一の台。
     *
     * 持ち出しの履歴は行き先の台を持っていないが、**1 台しか使っていない品番なら
     * 行き先はその台に決まる**（推測ではない）。ここだけは台ごとの実績を出せる。
     * 2 台以上で共用している品番（P500H は 12 台）は割り振れないので触らない
     */
    const soleAsset = new Map<string, number>();
    for (const toner of toners) {
      if (toner.printers.length === 1) {
        soleAsset.set(toner.id, toner.printers[0].printerAssetId);
      }
    }

    /*
     * 期間の終端は「その日いっぱい」。
     * from / to は @db.Date に合わせた UTC 0 時なので、時刻を持つ createdAt を
     * to とそのまま比べると**終了日に記録したぶんが丸ごと外れる**。
     * 翌日 0 時を上限にして、当日を含める
     */
    const toExclusive = new Date(to.getTime() + 86_400_000);
    const inPeriod = entries.filter((entry) => {
      const when = entry.receivedOn ?? entry.createdAt;
      return when >= from && when < toExclusive;
    });

    /*
     * 品番ごとの期間内の本数。**履歴 1 周でまとめる。**
     * 品番ごとに履歴を絞り直すと、品番数 × 履歴件数の総当たりになる
     */
    const unitsByToner = new Map<
      string,
      { received: number; issued: number }
    >();
    for (const entry of inPeriod) {
      if (entry.action !== 'RECEIVE' && entry.action !== 'ISSUE') continue;
      const cur = unitsByToner.get(entry.tonerId) ?? { received: 0, issued: 0 };
      if (entry.action === 'RECEIVE') cur.received += entry.quantity;
      else cur.issued += entry.quantity;
      unitsByToner.set(entry.tonerId, cur);
    }

    const actualByAsset = new Map<
      number,
      { tonerCost: number; issues: number }
    >();
    for (const entry of inPeriod) {
      if (entry.action !== 'ISSUE') continue;
      const assetId = soleAsset.get(entry.tonerId);
      if (assetId === undefined) continue;
      const price = costs.get(entry.tonerId)?.price ?? null;
      if (price === null) continue;
      const cur = actualByAsset.get(assetId) ?? { tonerCost: 0, issues: 0 };
      cur.tonerCost += entry.quantity * price;
      cur.issues += entry.quantity;
      actualByAsset.set(assetId, cur);
    }

    const rows = assets.map((asset) => {
      const printer = matchPrinter(asset, live);
      const counted =
        printer !== null ? pagesByPrinter.get(printer.id) : undefined;
      const pages = counted?.pages ?? null;
      const colorPages = counted?.color ?? 0;
      /** カラーの内訳が全枚数ぶん取れているか */
      const splitKnown =
        counted !== undefined && counted.splitPages >= counted.pages;

      const linked = asset.toners
        .map((link) => costs.get(link.tonerId))
        .filter((toner): toner is TonerCost => toner !== undefined);

      // 黒・ドラム・廃トナーは全枚数で減る。色はカラー 1 枚のときだけ足す
      const base = linked.filter((toner) => !toner.isColor);
      const color = linked.filter((toner) => toner.isColor);
      const sum = (list: TonerCost[]) =>
        list.reduce((total, toner) => total + (toner.costPerPage ?? 0), 0);

      const baseCpp = sum(base);
      const colorCpp = sum(color);
      /** 単価を出せなかった品番。あるとトナー代が過小になる */
      const missing = linked
        .filter((toner) => toner.costPerPage === null)
        .map((toner) => toner.id);

      const tonerCost =
        pages === null ? null : pages * baseCpp + colorPages * colorCpp;

      /** 実績を出せる台か。紐づけの全品番がこの台専用なら、持ち出しが確定する */
      const attributable =
        linked.length > 0 && linked.every((toner) => soleAsset.has(toner.id));

      // 本体は購入金額を償却年数で割った年額、保守は契約金額を契約年数で割った年額
      const perYearBody =
        asset.purchasePrice === null ? null : asset.purchasePrice / years;

      const maintYears =
        asset.maintStartOn && asset.maintEndOn
          ? Math.max(
              daysBetween(asset.maintStartOn, asset.maintEndOn) / DAYS_PER_YEAR,
              1 / 12,
            )
          : null;
      const perYearMaint =
        asset.maintFee !== null && maintYears !== null
          ? asset.maintFee / maintYears
          : null;

      const body = perYearBody === null ? null : perYearBody * share;
      const maint = perYearMaint === null ? null : perYearMaint * share;
      const repair = repairByAsset.get(asset.id) ?? { cost: 0, known: 0 };

      const total = (tonerCost ?? 0) + (body ?? 0) + (maint ?? 0) + repair.cost;

      return {
        id: asset.id,
        /** 持っている会社。全社まとめて出すので列として添える */
        companyId: asset.company?.id ?? null,
        company: asset.company?.name ?? null,
        no: asset.no,
        department: asset.department,
        maker: asset.maker,
        model: asset.model,
        /** 期間内の枚数。実機と結び付かない台は null */
        pages,
        colorPages: splitKnown ? colorPages : null,
        /** カラーの内訳が取れているか。取れていないカラー機はトナー代が下限になる */
        splitKnown,
        catalog: {
          /** モノクロ 1 枚ぶんのトナー代（黒・ドラム・廃トナー） */
          baseCostPerPage: baseCpp > 0 ? baseCpp : null,
          /** カラー 1 枚で上に乗るぶん */
          colorCostPerPage: colorCpp > 0 ? colorCpp : null,
          tonerCost,
          tonerCostPerPage:
            pages && tonerCost !== null ? tonerCost / pages : null,
          body,
          maint,
          repairCost: repair.cost,
          repairKnown: repair.known,
          total:
            pages === null && body === null && maint === null ? null : total,
          totalCostPerPage: pages ? total / pages : null,
          /** 単価が出せなかった紐づけ品番。あるとトナー代は過小 */
          missingCost: missing,
          tonerCount: linked.length,
        },
        /**
         * 実際に持ち出したぶん。
         * **紐づけている品番がすべて「この台だけが使う品番」のときだけ出す。**
         * 共用の品番が混じっていると、その台に入ったぶんを取りこぼした
         * 過小な額になり、カタログ値と並べたときに安く見えてしまう
         */
        actual: attributable
          ? (actualByAsset.get(asset.id) ?? { tonerCost: 0, issues: 0 })
          : null,
        /** 実績を出せない理由。画面のツールチップに出す */
        actualReason: attributable
          ? null
          : linked.length === 0
            ? ('no-toner' as const)
            : ('shared-toner' as const),
        /** 共用しているため割り振れない品番 */
        sharedToners: linked
          .filter((toner) => !soleAsset.has(toner.id))
          .map((toner) => toner.id),
      };
    });

    // ── 品番ごと ──────────────────────
    // 台に割り当てられない実績でも、品番ごとなら見積りと突き合わせられる
    const assetPages = new Map<number, { pages: number; color: number }>();
    for (const row of rows) {
      if (row.pages === null) continue;
      assetPages.set(row.id, { pages: row.pages, color: row.colorPages ?? 0 });
    }

    const tonerRows = toners
      .map((toner) => {
        const cost = costs.get(toner.id)!;

        // その品番を使う台の枚数。色は カラー枚数、黒や共通部品は全枚数で減る
        let pages = 0;
        for (const link of toner.printers) {
          const counted = assetPages.get(link.printerAssetId);
          if (!counted) continue;
          pages += cost.isColor ? counted.color : counted.pages;
        }

        const { received, issued } = unitsByToner.get(toner.id) ?? {
          received: 0,
          issued: 0,
        };

        /** カタログ値どおりなら期間内に何本使うはずか */
        const expected = toner.yieldPages ? pages / toner.yieldPages : null;

        return {
          id: toner.id,
          name: toner.name,
          color: toner.color,
          isColor: cost.isColor,
          price: cost.price,
          yieldPages: toner.yieldPages,
          costPerPage: cost.costPerPage,
          assetCount: toner.printers.length,
          pages,
          expectedUnits: expected,
          expectedCost:
            expected !== null && cost.price !== null
              ? expected * cost.price
              : null,
          receivedUnits: received,
          receivedCost: cost.price !== null ? received * cost.price : null,
          issuedUnits: issued,
          issuedCost: cost.price !== null ? issued * cost.price : null,
        };
      })
      // 期間内に動きがあったか、対象の台で刷っている品番だけ出す
      .filter(
        (row) => row.pages > 0 || row.receivedUnits > 0 || row.issuedUnits > 0,
      );

    return {
      period: { from: fromDate(from), to: fromDate(to), days },
      assumptions: {
        years,
        /** 保守金額は契約期間の総額として、契約年数で割って年額にしている */
        maintFeeBasis: 'contract-total' as const,
      },
      /** 画面の注意書きに出す、データの欠けぐあい */
      coverage: {
        assets: rows.length,
        withPages: rows.filter((row) => row.pages !== null).length,
        withPurchasePrice: rows.filter((row) => row.catalog.body !== null)
          .length,
        withMaint: rows.filter((row) => row.catalog.maint !== null).length,
        missingCostAssets: rows.filter(
          (row) => row.catalog.missingCost.length > 0,
        ).length,
        unsplitColorAssets: rows.filter(
          (row) => row.pages !== null && !row.splitKnown,
        ).length,
        /** 期間内のトナー履歴の件数。0 なら実績側は空 */
        entries: inPeriod.length,
        /** 実績を割り振れる台。紐づけの全品番がその台専用のもの */
        attributableAssets: rows.filter((row) => row.actual !== null).length,
      },
      printers: rows,
      toners: tonerRows,
    };
  }
}
