import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fromDate, toDate } from '../common/date';
import { toText } from '../common/text';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerInvoiceDto } from './dto/create-toner-invoice.dto';

/**
 * 期ずれとみなす日数。
 * 月末に入ったぶんが翌月の請求に回るのは普通に起きるので、
 * 期間の前後この日数だけ搬入を覗いて「期ずれかもしれない」と添える。
 * 判定を変えるものではなく、毎月出る食い違いの理由を示すための手がかり
 */
const NEARBY_DAYS = 31;

const MS_PER_DAY = 86_400_000;

/** 突き合わせ 1 行の状態 */
export type CheckStatus =
  | 'match'
  | 'qty-diff'
  | 'price-diff'
  | 'not-received'
  | 'not-invoiced'
  | 'unknown-price';

/** 価格履歴から、その日に有効だった税別価格を引く。無ければ null */
function priceOn(
  prices: { price: number; effectiveFrom: Date }[],
  date: Date,
): number | null {
  // 新しい順に入っているので、最初に見つかった「その日以前」の行が有効な価格
  return prices.find((row) => row.effectiveFrom <= date)?.price ?? null;
}

@Injectable()
export class TonerInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 請求書を 1 通登録する。明細ごと入れ替えのない新規作成。
   *
   * **同じ対象期間の請求書は 2 通目を受け付けない。** 月に 1 通なので、
   * 2 通目はたいてい入力し直しの二重登録になる。訂正請求のときは
   * 既存の 1 通を直すか、消してから入れ直す
   */
  async create(dto: CreateTonerInvoiceDto) {
    const period = this.parsePeriod(dto);
    this.assertNoDuplicateLine(dto);
    await this.assertTonersExist(dto);

    const already = await this.prisma.tonerInvoice.findFirst({
      where: { periodFrom: period.from, periodTo: period.to },
      select: { id: true },
    });
    if (already) {
      throw new ConflictException(
        `${dto.periodFrom} 〜 ${dto.periodTo} の請求書はすでに登録されています（ID ${already.id}）。訂正のときはそちらを直してください`,
      );
    }

    const saved = await this.prisma.tonerInvoice.create({
      data: {
        issuedOn: toDate(dto.issuedOn),
        periodFrom: period.from,
        periodTo: period.to,
        invoiceNo: toText(dto.invoiceNo),
        note: toText(dto.note),
        lines: {
          create: dto.lines.map((line) => ({
            tonerId: line.tonerId,
            quantity: line.quantity,
            unitPrice: line.unitPrice ?? null,
          })),
        },
      },
      include: this.withLines,
    });

    return this.toResponse(saved);
  }

  /** 一覧。新しい請求書から並べる */
  async findAll() {
    const rows = await this.prisma.tonerInvoice.findMany({
      orderBy: [{ periodTo: 'desc' }, { id: 'desc' }],
      include: this.withLines,
    });
    return rows.map((row) => this.toResponse(row));
  }

  async findOne(id: number) {
    const row = await this.prisma.tonerInvoice.findUnique({
      where: { id },
      include: this.withLines,
    });
    if (!row) {
      throw new NotFoundException(`ID ${id} の請求書は登録されていません`);
    }
    return this.toResponse(row);
  }

  /** 中身を入れ替える。明細は差分ではなく丸ごと置き換える（台帳と同じ考え方） */
  async update(id: number, dto: CreateTonerInvoiceDto) {
    await this.ensureExists(id);
    const period = this.parsePeriod(dto);
    this.assertNoDuplicateLine(dto);
    await this.assertTonersExist(dto);

    const clash = await this.prisma.tonerInvoice.findFirst({
      where: { periodFrom: period.from, periodTo: period.to, id: { not: id } },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `${dto.periodFrom} 〜 ${dto.periodTo} の請求書はすでに登録されています（ID ${clash.id}）`,
      );
    }

    const saved = await this.prisma.$transaction(async (tx) => {
      await tx.tonerInvoiceLine.deleteMany({ where: { invoiceId: id } });
      return tx.tonerInvoice.update({
        where: { id },
        data: {
          issuedOn: toDate(dto.issuedOn),
          periodFrom: period.from,
          periodTo: period.to,
          invoiceNo: toText(dto.invoiceNo),
          note: toText(dto.note),
          lines: {
            create: dto.lines.map((line) => ({
              tonerId: line.tonerId,
              quantity: line.quantity,
              unitPrice: line.unitPrice ?? null,
            })),
          },
        },
        include: this.withLines,
      });
    });

    return this.toResponse(saved);
  }

  /** 突き合わせを確かめた記録を残す。中身は変えない */
  async markChecked(id: number, checkedBy?: string) {
    await this.ensureExists(id);

    const saved = await this.prisma.tonerInvoice.update({
      where: { id },
      data: { checkedAt: new Date(), checkedBy: toText(checkedBy) },
      include: this.withLines,
    });
    return this.toResponse(saved);
  }

  async remove(id: number) {
    await this.ensureExists(id);
    // 明細は onDelete: Cascade で道連れに消える
    await this.prisma.tonerInvoice.delete({ where: { id } });
    return { id };
  }

  /**
   * 請求書と搬入の突き合わせ。
   *
   * **相手は注文ではなく搬入。** 払うのは実際に届いたぶんなので、
   * 対象期間に受け付けた搬入（TonerEntry の RECEIVE）を品番ごとに合計して比べる。
   *
   * 金額は**搬入 1 件ずつ、その搬入日に有効だった価格**で積む。
   * 期間の途中で値上げがあったとき、今の単価で全部を計算すると
   * 過去のぶんまで新しい価格で見積もることになるため（TonerPrice の持ち方と同じ理由）。
   *
   * 請求書にあって搬入が無い行・搬入があって請求書に無い行の**両方**を返す。
   * 片側しか出さないと、請求漏れと二重請求のどちらかを見落とす
   */
  async check(id: number) {
    const invoice = await this.prisma.tonerInvoice.findUnique({
      where: { id },
      include: this.withLines,
    });
    if (!invoice) {
      throw new NotFoundException(`ID ${id} の請求書は登録されていません`);
    }

    /*
     * 期間の終わりは「その日いっぱい」。
     * periodTo は @db.Date に合わせた UTC 0 時なので、時刻を持つ createdAt と
     * そのまま比べると**終了日に受け付けたぶんが丸ごと外れる**。翌日 0 時を上限にする
     */
    const from = invoice.periodFrom;
    const toExclusive = new Date(invoice.periodTo.getTime() + MS_PER_DAY);

    /*
     * 期間の前後 NEARBY_DAYS 日ぶんまで読む。
     * 期間内は突き合わせに、外は「期ずれかもしれない」の手がかりに使う
     */
    const wideFrom = new Date(from.getTime() - NEARBY_DAYS * MS_PER_DAY);
    const wideTo = new Date(toExclusive.getTime() + NEARBY_DAYS * MS_PER_DAY);

    /*
     * **搬入日が未入力の古い記録がある。** receivedOn は後から足した列なので、
     * それ以前の行は null のまま。受け付けた日（createdAt）で代える。
     * 落とすと搬入が無かったことになり、請求だけが浮いて見える
     */
    const entries = await this.prisma.tonerEntry.findMany({
      where: {
        action: 'RECEIVE',
        OR: [
          { receivedOn: { gte: wideFrom, lt: wideTo } },
          { receivedOn: null, createdAt: { gte: wideFrom, lt: wideTo } },
        ],
      },
      select: {
        tonerId: true,
        quantity: true,
        receivedOn: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 突き合わせに出てくる品番の価格履歴だけまとめて引く
    const tonerIds = [
      ...new Set([
        ...invoice.lines.map((line) => line.tonerId),
        ...entries.map((entry) => entry.tonerId),
      ]),
    ];
    const toners = await this.prisma.toner.findMany({
      where: { id: { in: tonerIds } },
      select: {
        id: true,
        name: true,
        color: true,
        prices: {
          orderBy: { effectiveFrom: 'desc' },
          select: { price: true, effectiveFrom: true },
        },
      },
    });
    const master = new Map(toners.map((toner) => [toner.id, toner]));

    /** 品番 → 期間内の搬入。金額は搬入日ごとの価格で積む */
    type Received = {
      quantity: number;
      /** 価格が引けたぶんの金額。引けない搬入があると priceKnown が false になる */
      amount: number;
      priceKnown: boolean;
      /** 期間外（前後）にあった搬入の本数。期ずれの手がかり */
      nearby: number;
    };
    const received = new Map<string, Received>();

    const slotFor = (tonerId: string): Received => {
      const slot = received.get(tonerId) ?? {
        quantity: 0,
        amount: 0,
        priceKnown: true,
        nearby: 0,
      };
      received.set(tonerId, slot);
      return slot;
    };

    for (const entry of entries) {
      // 搬入日が入っていない古い記録は、受け付けた日で代える
      const when = entry.receivedOn ?? entry.createdAt;

      const slot = slotFor(entry.tonerId);
      if (when < from || when >= toExclusive) {
        slot.nearby += entry.quantity;
        continue;
      }

      slot.quantity += entry.quantity;
      const price = priceOn(master.get(entry.tonerId)?.prices ?? [], when);
      if (price === null) {
        slot.priceKnown = false;
      } else {
        slot.amount += price * entry.quantity;
      }
    }

    const byToner = new Map(
      invoice.lines.map((line) => [line.tonerId, line] as const),
    );

    /*
     * 行に出す品番。**請求書にある品番と、期間内に搬入があった品番。**
     *
     * 期間外の搬入しかない品番は出さない。請求も搬入も 0 の行になり、
     * 突き合わせるものが無いのに「請求なし」として並んでしまう。
     * 期ずれの手がかり（nearby）は、食い違いのある行に添えてこそ意味がある
     */
    const shown = [
      ...new Set([
        ...byToner.keys(),
        ...[...received.entries()]
          .filter(([, slot]) => slot.quantity > 0)
          .map(([tonerId]) => tonerId),
      ]),
    ];

    const rows = shown.map((tonerId) => {
      const line = byToner.get(tonerId) ?? null;
      const got = received.get(tonerId) ?? null;
      const toner = master.get(tonerId);

      const invoiceQty = line?.quantity ?? 0;
      const unitPrice = line?.unitPrice ?? null;
      const invoiceAmount =
        line && unitPrice !== null ? unitPrice * line.quantity : null;

      const receivedQty = got?.quantity ?? 0;
      const dataAmount = got && got.priceKnown ? got.amount : null;

      const qtyDiff = invoiceQty - receivedQty;
      const amountDiff =
        invoiceAmount !== null && dataAmount !== null
          ? invoiceAmount - dataAmount
          : null;

      return {
        tonerId,
        name: toner?.name ?? null,
        color: toner?.color ?? null,
        /** 請求書に明細があるか。無ければ搬入だけの行 */
        onInvoice: line !== null,
        invoiceQty,
        unitPrice,
        invoiceAmount,
        receivedQty,
        dataAmount,
        qtyDiff,
        amountDiff,
        /** 期間の前後にあった搬入の本数。0 でなければ期ずれを疑う */
        nearbyQty: got?.nearby ?? 0,
        status: this.statusOf({
          onInvoice: line !== null,
          receivedQty,
          qtyDiff,
          invoiceAmount,
          dataAmount,
          amountDiff,
        }),
      };
    });

    rows.sort((a, b) =>
      a.tonerId.localeCompare(b.tonerId, 'ja', { numeric: true }),
    );

    /** 合計。金額は出せた行だけを足し、出せない行は件数で示す */
    const sum = (pick: (row: (typeof rows)[number]) => number | null) =>
      rows.reduce((total, row) => total + (pick(row) ?? 0), 0);

    const invoiceTotal = sum((row) => row.invoiceAmount);
    const dataTotal = sum((row) => row.dataAmount);

    return {
      invoice: this.toResponse(invoice),
      rows,
      totals: {
        invoiceQty: sum((row) => row.invoiceQty),
        receivedQty: sum((row) => row.receivedQty),
        invoiceAmount: invoiceTotal,
        dataAmount: dataTotal,
        amountDiff: invoiceTotal - dataTotal,
        /** 金額を出せなかった行数。合計に入っていないので添えて出す */
        unknownAmount: rows.filter(
          (row) => row.invoiceAmount === null || row.dataAmount === null,
        ).length,
      },
      /** 一致しなかった行数。0 なら請求書どおり */
      mismatches: rows.filter((row) => row.status !== 'match').length,
    };
  }

  // ── 内部ヘルパー ──────────────────────

  private readonly withLines = {
    lines: {
      orderBy: { tonerId: 'asc' },
      include: { toner: { select: { name: true, color: true } } },
    },
  } as const;

  /**
   * 行の状態。**個数を先に見る。**
   * 本数が違えば金額も当然ずれるので、先に金額差を出すと理由が分かりにくくなる
   */
  private statusOf(row: {
    onInvoice: boolean;
    receivedQty: number;
    qtyDiff: number;
    invoiceAmount: number | null;
    dataAmount: number | null;
    amountDiff: number | null;
  }): CheckStatus {
    if (!row.onInvoice) return 'not-invoiced';
    if (row.receivedQty === 0) return 'not-received';
    if (row.qtyDiff !== 0) return 'qty-diff';
    if (row.invoiceAmount === null || row.dataAmount === null) {
      return 'unknown-price';
    }
    return row.amountDiff === 0 ? 'match' : 'price-diff';
  }

  private parsePeriod(dto: CreateTonerInvoiceDto) {
    const from = toDate(dto.periodFrom);
    const to = toDate(dto.periodTo);
    if (from > to) {
      throw new BadRequestException(
        '対象期間の開始日は終了日より前の日付を指定してください',
      );
    }
    return { from, to };
  }

  /** 同じ品番が 2 行あると、どちらが正か決められないので弾く */
  private assertNoDuplicateLine(dto: CreateTonerInvoiceDto) {
    const seen = new Set<string>();
    for (const line of dto.lines) {
      if (seen.has(line.tonerId)) {
        throw new BadRequestException(
          `${line.tonerId} が 2 行あります。1 行にまとめて入力してください`,
        );
      }
      seen.add(line.tonerId);
    }
  }

  /** 未登録の品番を弾く。外部キー違反を 500 で返さないため */
  private async assertTonersExist(dto: CreateTonerInvoiceDto) {
    const ids = [...new Set(dto.lines.map((line) => line.tonerId))];
    const found = await this.prisma.toner.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    const registered = new Set(found.map((row) => row.id));
    const missing = ids.filter((id) => !registered.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `${missing.join(', ')} は未登録です。先にトナー登録を行ってください`,
      );
    }
  }

  /** 請求書があることだけ確かめる。更新・削除の前置き */
  private async ensureExists(id: number) {
    const found = await this.prisma.tonerInvoice.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(`ID ${id} の請求書は登録されていません`);
    }
  }

  private toResponse(invoice: {
    id: number;
    issuedOn: Date;
    periodFrom: Date;
    periodTo: Date;
    invoiceNo: string | null;
    note: string | null;
    checkedAt: Date | null;
    checkedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    lines: {
      id: number;
      tonerId: string;
      quantity: number;
      unitPrice: number | null;
      toner: { name: string | null; color: string | null };
    }[];
  }) {
    const lines = invoice.lines.map((line) => ({
      id: line.id,
      tonerId: line.tonerId,
      name: line.toner.name,
      color: line.toner.color,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      /** 単価 × 本数。単価が未入力なら出さない */
      amount: line.unitPrice === null ? null : line.unitPrice * line.quantity,
    }));

    return {
      id: invoice.id,
      issuedOn: fromDate(invoice.issuedOn),
      periodFrom: fromDate(invoice.periodFrom),
      periodTo: fromDate(invoice.periodTo),
      invoiceNo: invoice.invoiceNo,
      note: invoice.note,
      checkedAt: invoice.checkedAt,
      checkedBy: invoice.checkedBy,
      lines,
      /** 明細の本数と金額の合計。単価未入力の行は金額に足さない */
      totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
      totalAmount: lines.reduce((sum, line) => sum + (line.amount ?? 0), 0),
      /** 単価が未入力の明細数。合計が請求書と合わない理由になる */
      unpricedLines: lines.filter((line) => line.unitPrice === null).length,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}
