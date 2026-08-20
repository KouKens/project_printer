import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkTonerEntryDto } from './dto/bulk-toner-entry.dto';
import { CreateTonerEntryDto } from './dto/create-toner-entry.dto';
import { StockTakeDto } from './dto/stock-take.dto';

/** $transaction のコールバックが受け取るクライアント */
type Tx = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

export type TonerAction =
  'REGISTER' | 'RECEIVE' | 'ISSUE' | 'DISPOSE' | 'ADJUST';

/**
 * 棚卸しでユーザーIDが未入力だったときに記録する値。
 * user_id は NOT NULL なので空では入れられない。
 * 職員証のIDと混ざらない値にして、履歴で誰が数えたか不明な行と分かるようにする。
 */
export const GUEST_USER = 'ゲスト';

/** 棚卸しの結果 1 行分 */
export type StockTakeRow = {
  tonerId: string;
  name: string | null;
  /** 調整前の在庫 */
  before: number;
  /** 数えた本数。調整後の在庫でもある */
  counted: number;
  /** counted - before。0 なら記録していない */
  diff: number;
  status: 'adjusted' | 'same' | 'unknown';
};

export type EntryResult = {
  tonerId: string;
  name: string | null;
  action: TonerAction;
  quantity: number;
  /** 現在庫 */
  stock: number;
  /** 搬入累計 */
  received: number;
  /** 廃棄累計 */
  disposed: number;
};

@Injectable()
export class TonerEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTonerEntryDto): Promise<EntryResult> {
    return this.prisma.$transaction((tx) => this.apply(tx, dto));
  }

  /**
   * 複数行をまとめて処理する。区分とユーザーIDは全行で共通。
   *
   * **1 行でも通らなければ全体を取り消す。** 窓口では紙の伝票 1 枚が
   * 1 回の操作にあたる。半分だけ在庫が動くと、どこまで済んだのかが
   * 画面にも履歴にも残らず、数え直すしかなくなるため。
   */
  bulk(dto: BulkTonerEntryDto): Promise<EntryResult[]> {
    return this.prisma.$transaction(async (tx) => {
      const results: EntryResult[] = [];
      for (const item of dto.items) {
        results.push(
          await this.apply(tx, {
            action: dto.action,
            userId: dto.userId,
            tonerId: item.tonerId,
            name: item.name,
            quantity: item.quantity,
          }),
        );
      }
      return results;
    });
  }

  /** 区分ごとの処理の振り分け。呼び出し側でトランザクションを張る */
  private apply(tx: Tx, dto: CreateTonerEntryDto): Promise<EntryResult> {
    switch (dto.action) {
      case 'REGISTER':
        return this.register(tx, dto);
      case 'RECEIVE':
        return this.receive(tx, dto);
      case 'ISSUE':
        return this.issue(tx, dto);
      case 'DISPOSE':
        return this.dispose(tx, dto);
    }
  }

  /** 登録：マスタに品番を追加し、在庫を 0 で作る */
  private async register(
    tx: Tx,
    dto: CreateTonerEntryDto,
  ): Promise<EntryResult> {
    const exists = await tx.toner.findUnique({ where: { id: dto.tonerId } });
    if (exists) {
      throw new ConflictException(
        `${dto.tonerId} はすでに登録されています。搬入を選んでください`,
      );
    }

    const toner = await tx.toner.create({
      data: {
        id: dto.tonerId,
        name: dto.name?.trim() || null,
        stock: { create: {} },
      },
      include: { stock: true },
    });

    await tx.tonerEntry.create({
      data: {
        userId: dto.userId,
        tonerId: dto.tonerId,
        action: 'REGISTER',
        quantity: 0,
        balance: 0,
      },
    });

    return {
      tonerId: toner.id,
      name: toner.name,
      action: 'REGISTER' as const,
      quantity: 0,
      stock: 0,
      received: 0,
      disposed: 0,
    };
  }

  /** 搬入：在庫と搬入累計を増やす */
  private async receive(
    tx: Tx,
    dto: CreateTonerEntryDto,
  ): Promise<EntryResult> {
    const count = dto.quantity ?? 1;

    const toner = await this.requireToner(tx, dto.tonerId);

    const stock = await tx.tonerStock.update({
      where: { tonerId: dto.tonerId },
      data: {
        quantity: { increment: count },
        received: { increment: count },
      },
    });

    await tx.tonerEntry.create({
      data: {
        userId: dto.userId,
        tonerId: dto.tonerId,
        action: 'RECEIVE',
        quantity: count,
        balance: stock.quantity,
      },
    });

    return this.toResult(toner.id, toner.name, 'RECEIVE', count, stock);
  }

  /** 持ち出し：在庫を減らす。在庫を超える本数は受け付けない */
  private async issue(tx: Tx, dto: CreateTonerEntryDto): Promise<EntryResult> {
    const count = dto.quantity ?? 1;

    const toner = await this.requireToner(tx, dto.tonerId);
    const current = toner.stock?.quantity ?? 0;

    if (current < count) {
      throw new UnprocessableEntityException(
        `在庫が足りません。${dto.tonerId} の在庫は ${current} 本です`,
      );
    }

    const stock = await tx.tonerStock.update({
      where: { tonerId: dto.tonerId },
      data: { quantity: { decrement: count } },
    });

    await tx.tonerEntry.create({
      data: {
        userId: dto.userId,
        tonerId: dto.tonerId,
        action: 'ISSUE',
        quantity: count,
        balance: stock.quantity,
      },
    });

    return this.toResult(toner.id, toner.name, 'ISSUE', count, stock);
  }

  /**
   * 廃棄：廃棄累計を増やす。
   * 廃棄累計は搬入累計を超えられない（搬入していない本数は廃棄できない）。
   * 現在庫は変えない。棚にある未使用品を捨てる運用なら
   * data に quantity: { decrement: count } を足し、在庫チェックを加える。
   */
  private async dispose(
    tx: Tx,
    dto: CreateTonerEntryDto,
  ): Promise<EntryResult> {
    const count = dto.quantity ?? 1;

    const toner = await this.requireToner(tx, dto.tonerId);

    const received = toner.stock?.received ?? 0;
    const disposed = toner.stock?.disposed ?? 0;
    const allowance = received - disposed;

    if (count > allowance) {
      throw new UnprocessableEntityException(
        allowance === 0
          ? `${dto.tonerId} は廃棄できる本数がありません（搬入 ${received} 本／廃棄済み ${disposed} 本）`
          : `廃棄できるのは ${allowance} 本までです（搬入 ${received} 本／廃棄済み ${disposed} 本）`,
      );
    }

    const stock = await tx.tonerStock.update({
      where: { tonerId: dto.tonerId },
      data: { disposed: { increment: count } },
    });

    await tx.tonerEntry.create({
      data: {
        userId: dto.userId,
        tonerId: dto.tonerId,
        action: 'DISPOSE',
        quantity: count,
        balance: stock.quantity,
      },
    });

    return this.toResult(toner.id, toner.name, 'DISPOSE', count, stock);
  }

  /**
   * 棚卸し：棚で数えた本数に在庫を合わせる。
   *
   * 差のある行だけ在庫を書き換え、ADJUST の履歴を残す。差が無い行は何もしない
   * （数えた事実だけの履歴が並ぶと、あとで差の出た日を探しにくくなるため）。
   *
   * **搬入累計・廃棄累計は動かさない。** これらは「何本入れて何本捨てたか」の
   * 記録で、数え直しで変わる性質のものではない。廃棄の上限計算もこの 2 つで
   * 行っているので、棚卸しで動かすと過去の辻褄が合わなくなる。
   */
  async stockTake(dto: StockTakeDto): Promise<StockTakeRow[]> {
    const userId = dto.userId?.trim() || GUEST_USER;

    return this.prisma.$transaction(async (tx) => {
      const rows: StockTakeRow[] = [];

      for (const count of dto.counts) {
        const toner = await tx.toner.findUnique({
          where: { id: count.tonerId },
          include: { stock: true },
        });

        // 一覧を開いたあとに消えた品番。ここで止めず、他の行は通す
        if (!toner) {
          rows.push({
            tonerId: count.tonerId,
            name: null,
            before: 0,
            counted: count.counted,
            diff: 0,
            status: 'unknown',
          });
          continue;
        }

        const before = toner.stock?.quantity ?? 0;
        const diff = count.counted - before;

        if (diff === 0) {
          rows.push({
            tonerId: toner.id,
            name: toner.name,
            before,
            counted: count.counted,
            diff: 0,
            status: 'same',
          });
          continue;
        }

        await tx.tonerStock.upsert({
          where: { tonerId: toner.id },
          create: { tonerId: toner.id, quantity: count.counted },
          update: { quantity: count.counted },
        });

        await tx.tonerEntry.create({
          data: {
            userId,
            tonerId: toner.id,
            action: 'ADJUST',
            // quantity は 0 以上で持つ決まりなので、増減の向きは balance で読む
            quantity: Math.abs(diff),
            balance: count.counted,
          },
        });

        rows.push({
          tonerId: toner.id,
          name: toner.name,
          before,
          counted: count.counted,
          diff,
          status: 'adjusted',
        });
      }

      return rows;
    });
  }

  /** 在庫一覧 */
  async findStock() {
    const toners = await this.prisma.toner.findMany({
      include: { stock: true },
      orderBy: { id: 'asc' },
    });

    return toners.map((t) => ({
      id: t.id,
      name: t.name,
      // 棚卸しの画面が同じ品番の色違いを見分けるのに使う
      color: t.color,
      quantity: t.stock?.quantity ?? 0,
      received: t.stock?.received ?? 0,
      disposed: t.stock?.disposed ?? 0,
      updatedAt: t.stock?.updatedAt ?? t.updatedAt,
    }));
  }

  /** 履歴（直近 20 件） */
  findRecent() {
    return this.prisma.tonerEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { toner: { select: { name: true } } },
    });
  }

  // ── 内部ヘルパー ──────────────────────

  private async requireToner(tx: Tx, tonerId: string) {
    const toner = await tx.toner.findUnique({
      where: { id: tonerId },
      include: { stock: true },
    });

    if (!toner) {
      throw new NotFoundException(
        `${tonerId} は未登録です。先に登録を行ってください`,
      );
    }
    return toner;
  }

  private toResult(
    id: string,
    name: string | null,
    action: TonerAction,
    quantity: number,
    stock: { quantity: number; received: number; disposed: number },
  ): EntryResult {
    return {
      tonerId: id,
      name,
      action,
      quantity,
      stock: stock.quantity,
      received: stock.received,
      disposed: stock.disposed,
    };
  }
}
