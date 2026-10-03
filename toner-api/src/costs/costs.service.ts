import { Injectable } from '@nestjs/common';
import { fromDate, startOfDay, toDate, today } from '../common/date';
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

/**
 * 1 台に紐づいた品番を、純正とリサイクル品の組ごとに 1 つへ絞る。
 *
 * 純正 P500H とリサイクル品 P500H-R が同じ台に紐づいていても、実際に減るのは
 * どちらか一方。両方の単価を足すとトナー代が倍になる。
 * 使っていない側は「他の画面に出さない」にしておけば最初から外れるので、
 * ここに来るのは両方とも出している場合だけ。**リサイクル品を残す**
 * （純正の代わりに使うためにリサイクル品を組にしているので）。
 * リサイクル品どうしが並んだときは品番の若いほう
 */
export function oneOfEachFamily(linked: TonerCost[]): TonerCost[] {
  const picked = new Map<string, TonerCost>();
  for (const toner of linked) {
    const held = picked.get(toner.family);
    if (
      !held ||
      (toner.recycled && !held.recycled) ||
      (toner.recycled === held.recycled && toner.id < held.id)
    ) {
      picked.set(toner.family, toner);
    }
  }
  // 元の並び（台帳の紐づけの順）を保つ
  return linked.filter((toner) => picked.get(toner.family) === toner);
}

/** 期間の指定。未指定なら枚数の記録がある全期間 */
export type CostQuery = {
  from?: string;
  to?: string;
  /** 本体を何年で償却するか */
  years?: number;
};

/** 価格の履歴 1 行。適用開始日は @db.Date（UTC 0 時の器） */
export type PriceRow = { price: number; effectiveFrom: Date };

/**
 * その日に有効だった価格。**履歴は新しい順に並んでいる前提。**
 *
 * **最初の価格より前の日は、最初の価格で数える。** 最初の行の適用開始日は
 * たいてい「品番を登録した日」で、その日から値段が付いたわけではない
 * （取り込んだ品番は取り込んだ日になっている）。null にすると、
 * 登録より前の枚数や搬入がまるごとトナー代から抜ける。
 * 価格が 1 件も無いときだけ null。
 *
 * **請求書の突き合わせ（toner-invoices の priceOn）は扱いが違う**——あちらは
 * 最初の価格より前を null（価格不明）にする。請求額と比べて一致を判定するので、
 * 推し量った価格で「一致」と出すわけにいかない。こちらは見積りなので埋める
 */
export function priceOn(prices: PriceRow[], day: Date): number | null {
  const row = prices.find((p) => p.effectiveFrom <= day) ?? prices.at(-1);
  return row?.price ?? null;
}

/** そのトナーの 1 枚あたり単価。価格と枚数の両方が要る */
export type TonerCost = {
  id: string;
  name: string | null;
  color: string | null;
  recycled: boolean;
  /**
   * 純正とリサイクル品の組の鍵（純正の品番）。組を作っていなければ自分の品番。
   * 同じ台に組の 2 つが紐づいていても、減るのは片方なので 1 つだけ数える
   */
  family: string;
  /**
   * 価格の履歴。新しい順。**単価は日ごとに `costPerPageOn` で引く** ——
   * 今日の価格 1 つで期間全体を数えると、値上げの前の期間まで新しい価格になる
   */
  prices: PriceRow[];
  yieldPages: number | null;
  isColor: boolean;
};

/**
 * その日の 1 枚あたり単価。価格と印刷可能枚数の両方が要る。
 * `priceOn` が最初の価格より前も埋めるので、null になるのは
 * 価格か枚数が未登録の品番だけ（日によって出たり出なかったりしない）
 */
export function costPerPageOn(toner: TonerCost, day: Date): number | null {
  const price = priceOn(toner.prices, day);
  return price !== null && toner.yieldPages ? price / toner.yieldPages : null;
}

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
            // 運用コストは全拠点まとめて見る。どこの機器かが分かるよう拠点も引く
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
          // 他の画面に出さない品番（価格を比べるためだけの純正など）は使っていないので数えない
          where: { hidden: false },
          select: {
            id: true,
            name: true,
            color: true,
            recycled: true,
            genuineId: true,
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
    // 記録が無いときの代わりも暦日（UTC 0 時の器）にする。今の時刻のままだと
    // 適用開始日（@db.Date）と比べたとき、JST の朝 9 時まで今日の改定が効かない
    const dates = dailies.map((row) => row.date);
    const first = dates.length > 0 ? dates[0] : today();
    const last = dates.length > 0 ? dates[dates.length - 1] : today();
    const from = query.from ? toDate(query.from) : first;
    const to = query.to ? toDate(query.to) : last;
    const days = Math.max(daysBetween(from, to), 1);
    /** 期間が 1 年に占める割合。年額を期間ぶんに割るのに使う */
    const share = days / DAYS_PER_YEAR;

    /**
     * 「期間の単価」を 1 つ出すときに見る日。期間の終わり、ただし今日より先は今日。
     * 終わりを先の日付にしたとき、まだ効いていない改定（予定）を単価として出さない
     * （先の日には枚数も受け払いも無いので、合計には効かない）
     */
    const priceDay = to < today() ? to : today();

    /*
     * **トナーの価格は、その日に有効だったものを使う。**
     * 枚数は記録した日の、搬入・持ち出しは受け付けた日の価格で数える。
     * 今日の価格 1 つで数えていたときは、値上げの前の期間まで新しい価格になり、
     * 期間の途中で改定があると見積りと実績の差に価格の差が混ざった
     */
    const costs = new Map<string, TonerCost>();
    for (const toner of toners) {
      costs.set(toner.id, {
        id: toner.id,
        name: toner.name,
        color: toner.color,
        recycled: toner.recycled,
        family: toner.genuineId ?? toner.id,
        prices: toner.prices,
        yieldPages: toner.yieldPages,
        isColor: isColorSupply(toner.color),
      });
    }

    // 台帳 → 実機。突き合わせ方は printer-match（他の一覧と同じ）
    const live = indexPrinters(printers, assets);

    /*
     * 実機ごとの期間内の枚数。**日ごとの内訳も残す**
     * （改定をまたぐ期間は、日ごとにその日の単価を掛けて足すため）
     */
    type Day = { date: Date; pages: number; color: number };
    type Pages = {
      pages: number;
      color: number;
      splitPages: number;
      days: Day[];
    };
    const pagesByPrinter = new Map<number, Pages>();
    for (const row of dailies) {
      if (row.date < from || row.date > to) continue;
      if (row.pages === null) continue;
      const cur = pagesByPrinter.get(row.printerId) ?? {
        pages: 0,
        color: 0,
        splitPages: 0,
        days: [],
      };
      cur.pages += row.pages;
      if (row.colorPages !== null) {
        cur.color += row.colorPages;
        cur.splitPages += row.pages;
      }
      cur.days.push({
        date: row.date,
        pages: row.pages,
        color: row.colorPages ?? 0,
      });
      pagesByPrinter.set(row.printerId, cur);
    }

    /** 品番を並べた 1 枚あたり単価の和。その日の価格で */
    const sumOn = (list: TonerCost[], day: Date) =>
      list.reduce(
        (total, toner) => total + (costPerPageOn(toner, day) ?? 0),
        0,
      );

    /** 日ごとに「枚数 × その日の単価」を足したトナー代 */
    const costOver = (
      days: Day[],
      list: TonerCost[],
      pagesOf: (day: Day) => number,
    ) =>
      days.reduce(
        (total, day) => total + pagesOf(day) * sumOn(list, day.date),
        0,
      );

    /**
     * 期間の 1 枚あたり単価。改定をまたぐと日によって違うので、
     * 数えたトナー代を枚数で割った平均にする（枚数 × 単価がトナー代に一致する）。
     * 1 枚も刷っていなければ期間の終わり（今日より先なら今日）の単価
     */
    const perPageOver = (cost: number, pages: number, list: TonerCost[]) =>
      pages > 0 ? cost / pages : sumOn(list, priceDay);

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
     * 期間は「開始日から終了日まで、両端を含む」。
     *
     * from / to は @db.Date に合わせた **UTC 0 時の器**。搬入日（receivedOn）も
     * 同じ器なのでそのまま比べられるが、**createdAt は時刻を持つ本物の日時**で、
     * そのまま比べると JST では丸ごと 9 時間ずれる。開始日の朝 9 時より前に
     * 記録したぶんが前日扱いで外れ、代わりに終了日の翌朝 9 時までが入ってしまう。
     * 暦日に直してから比べる（どの日かはローカル時刻で決める）
     */
    const dayOf = (entry: (typeof entries)[number]) =>
      entry.receivedOn ?? startOfDay(entry.createdAt);
    const inPeriod = entries.filter((entry) => {
      const when = dayOf(entry);
      return when >= from && when <= to;
    });

    /** 受け払い 1 件の単価。受け付けた日（搬入日があればその日）の価格 */
    const entryPrice = (entry: (typeof entries)[number]) => {
      const cost = costs.get(entry.tonerId);
      return cost ? priceOn(cost.prices, dayOf(entry)) : null;
    };

    /*
     * 品番ごとの期間内の本数と金額。**履歴 1 周でまとめる。**
     * 品番ごとに履歴を絞り直すと、品番数 × 履歴件数の総当たりになる。
     * 金額は 1 件ずつその日の価格で足す（改定の前後で本数 × 今の価格にならない）
     */
    const unitsByToner = new Map<
      string,
      {
        received: number;
        issued: number;
        receivedCost: number;
        issuedCost: number;
      }
    >();
    for (const entry of inPeriod) {
      if (entry.action !== 'RECEIVE' && entry.action !== 'ISSUE') continue;
      const cur = unitsByToner.get(entry.tonerId) ?? {
        received: 0,
        issued: 0,
        receivedCost: 0,
        issuedCost: 0,
      };
      const amount = entry.quantity * (entryPrice(entry) ?? 0);
      if (entry.action === 'RECEIVE') {
        cur.received += entry.quantity;
        cur.receivedCost += amount;
      } else {
        cur.issued += entry.quantity;
        cur.issuedCost += amount;
      }
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
      const price = entryPrice(entry);
      if (price === null) continue;
      const cur = actualByAsset.get(assetId) ?? { tonerCost: 0, issues: 0 };
      cur.tonerCost += entry.quantity * price;
      cur.issues += entry.quantity;
      actualByAsset.set(assetId, cur);
    }

    /**
     * 台 → 期間内の日ごとの枚数。下の品番ごとの表が使う。
     * カラーの内訳が全枚数ぶん取れていない台は、カラーを 0 として渡す
     * （台ごとの colorPages を null にしているのと同じ扱い）
     */
    const daysByAsset = new Map<number, Day[]>();

    const rows = assets.map((asset) => {
      const printer = matchPrinter(asset, live);
      const counted =
        printer !== null ? pagesByPrinter.get(printer.id) : undefined;
      const pages = counted?.pages ?? null;
      const colorPages = counted?.color ?? 0;
      /** カラーの内訳が全枚数ぶん取れているか */
      const splitKnown =
        counted !== undefined && counted.splitPages >= counted.pages;
      if (counted) {
        daysByAsset.set(
          asset.id,
          splitKnown
            ? counted.days
            : counted.days.map((day) => ({ ...day, color: 0 })),
        );
      }

      const linked = oneOfEachFamily(
        asset.toners
          .map((link) => costs.get(link.tonerId))
          .filter((toner): toner is TonerCost => toner !== undefined),
      );

      // 黒・ドラム・廃トナーは全枚数で減る。色はカラー 1 枚のときだけ足す
      const base = linked.filter((toner) => !toner.isColor);
      const color = linked.filter((toner) => toner.isColor);

      // 日ごとにその日の単価で数える。改定の無い期間なら 枚数 × 単価 と同じ
      // 外の `days`（期間の日数）と取り違えないよう別の名前にする
      const dayRows = counted?.days ?? [];
      const baseCost = costOver(dayRows, base, (day) => day.pages);
      const colorCost = costOver(dayRows, color, (day) => day.color);

      const baseCpp = perPageOver(baseCost, pages ?? 0, base);
      const colorCpp = perPageOver(colorCost, colorPages, color);
      /** 単価を出せなかった品番。あるとトナー代が過小になる */
      const missing = linked
        .filter((toner) => costPerPageOn(toner, priceDay) === null)
        .map((toner) => toner.id);

      const tonerCost = pages === null ? null : baseCost + colorCost;

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
        /** 持っている拠点。全拠点まとめて出すので列として添える */
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
    const tonerRows = toners
      .map((toner) => {
        const cost = costs.get(toner.id)!;
        /** 価格が 1 件も無い品番は金額を出さない（0 円ではない） */
        const priced = cost.prices.length > 0;

        // その品番を使う台の枚数。色は カラー枚数、黒や共通部品は全枚数で減る
        let pages = 0;
        /** 日ごとに「枚数 × その日の単価」を足した想定金額 */
        let expectedCost = 0;
        for (const link of toner.printers) {
          for (const day of daysByAsset.get(link.printerAssetId) ?? []) {
            const counted = cost.isColor ? day.color : day.pages;
            pages += counted;
            expectedCost += counted * (costPerPageOn(cost, day.date) ?? 0);
          }
        }

        const units = unitsByToner.get(toner.id) ?? {
          received: 0,
          issued: 0,
          receivedCost: 0,
          issuedCost: 0,
        };

        /** カタログ値どおりなら期間内に何本使うはずか */
        const expected = toner.yieldPages ? pages / toner.yieldPages : null;
        const cpp = costPerPageOn(cost, priceDay);

        return {
          id: toner.id,
          name: toner.name,
          color: toner.color,
          isColor: cost.isColor,
          /** 期間の終わり（今日より先なら今日）に有効だった価格 */
          price: priceOn(cost.prices, priceDay),
          yieldPages: toner.yieldPages,
          /** 期間の 1 枚あたり単価。改定をまたぐときは 想定金額 ÷ 枚数 の平均 */
          costPerPage:
            cpp === null ? null : pages > 0 ? expectedCost / pages : cpp,
          assetCount: toner.printers.length,
          pages,
          expectedUnits: expected,
          expectedCost: expected !== null && priced ? expectedCost : null,
          receivedUnits: units.received,
          receivedCost: priced ? units.receivedCost : null,
          issuedUnits: units.issued,
          issuedCost: priced ? units.issuedCost : null,
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
