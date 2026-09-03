import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { fromDate, toDate, today } from '../common/date';
import { PrismaService, Tx } from '../prisma/prisma.service';
import { BulkTonerEntryDto } from './dto/bulk-toner-entry.dto';
import { CreateTonerEntryDto } from './dto/create-toner-entry.dto';
import { StockTakeDto } from './dto/stock-take.dto';

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
            // 会社はまとめ単位で 1 つ。1 回の伝票が会社をまたぐことは無い
            companyId: dto.companyId,
            tonerId: item.tonerId,
            name: item.name,
            quantity: item.quantity,
            // 搬入日はまとめ単位で 1 つ。行ごとには持たない
            receivedOn: dto.receivedOn,
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

    // 在庫の行はここでは作らない。「品番 × 会社」なので、
    // どの会社の分かは搬入して初めて決まる
    const toner = await tx.toner.create({
      data: {
        id: dto.tonerId,
        name: dto.name?.trim() || null,
      },
    });

    await tx.tonerEntry.create({
      data: {
        userId: dto.userId,
        tonerId: dto.tonerId,
        companyId: dto.companyId,
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

    const toner = await this.requireToner(tx, dto.tonerId, dto.companyId);

    const stock = await this.bumpStock(tx, dto.tonerId, dto.companyId, {
      quantity: count,
      received: count,
    });

    await tx.tonerEntry.create({
      data: {
        userId: dto.userId,
        tonerId: dto.tonerId,
        companyId: dto.companyId,
        action: 'RECEIVE',
        quantity: count,
        balance: stock.quantity,
        // 入力が無ければ受け付けた日。注文の次回搬入日と突き合わせる鍵になる
        receivedOn: toDate(dto.receivedOn) ?? today(),
      },
    });

    return this.toResult(toner.id, toner.name, 'RECEIVE', count, stock);
  }

  /** 持ち出し：在庫を減らす。在庫を超える本数は受け付けない */
  private async issue(tx: Tx, dto: CreateTonerEntryDto): Promise<EntryResult> {
    const count = dto.quantity ?? 1;

    const toner = await this.requireToner(tx, dto.tonerId, dto.companyId);
    const current = toner.stock?.quantity ?? 0;

    if (current < count) {
      throw new UnprocessableEntityException(
        `在庫が足りません。${dto.tonerId} の在庫は ${current} 本です`,
      );
    }

    const stock = await this.bumpStock(tx, dto.tonerId, dto.companyId, {
      quantity: -count,
    });

    await tx.tonerEntry.create({
      data: {
        userId: dto.userId,
        tonerId: dto.tonerId,
        companyId: dto.companyId,
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

    const toner = await this.requireToner(tx, dto.tonerId, dto.companyId);

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

    const stock = await this.bumpStock(tx, dto.tonerId, dto.companyId, {
      disposed: count,
    });

    await tx.tonerEntry.create({
      data: {
        userId: dto.userId,
        tonerId: dto.tonerId,
        companyId: dto.companyId,
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
      /*
       * 数えた品番を先にまとめて引く。**棚卸しは在庫の全品番が一度に来る**ので、
       * 1 行ずつ問い合わせるとその本数だけ往復し、そのあいだトランザクションを
       * 開けたままにすることになる
       */
      const toners = await tx.toner.findMany({
        where: { id: { in: dto.counts.map((count) => count.tonerId) } },
        // 在庫は「品番 × 会社」。この会社の行だけを見て合わせる
        include: { stocks: { where: { companyId: dto.companyId } } },
      });
      const known = new Map(toners.map((toner) => [toner.id, toner]));
      /** 書き換えたあとの在庫。同じ品番が 2 行来ても直前の結果から続けて数える */
      const quantities = new Map(
        toners.map((toner) => [toner.id, toner.stocks[0]?.quantity ?? 0]),
      );

      const rows: StockTakeRow[] = [];

      for (const count of dto.counts) {
        const toner = known.get(count.tonerId);

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

        const before = quantities.get(toner.id) ?? 0;
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
          where: {
            tonerId_companyId: {
              tonerId: toner.id,
              companyId: dto.companyId,
            },
          },
          create: {
            tonerId: toner.id,
            companyId: dto.companyId,
            quantity: count.counted,
          },
          update: { quantity: count.counted },
        });
        quantities.set(toner.id, count.counted);

        await tx.tonerEntry.create({
          data: {
            userId,
            tonerId: toner.id,
            companyId: dto.companyId,
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
  /**
   * 在庫の一覧。**会社ごと。** 棚卸しと受付の候補がここから作られる。
   *
   * 品番マスタは全社共通なので、行はどの会社でも同じ数だけ並ぶ。
   * その会社で一度も受け入れていない品番は在庫の行が無く、0 本として出る
   */
  async findStock(companyId: number) {
    const toners = await this.prisma.toner.findMany({
      include: { stocks: { where: { companyId } } },
      orderBy: { id: 'asc' },
    });

    return toners.map((t) => {
      // 会社で絞ってあるので 0 件か 1 件
      const stock = t.stocks[0] ?? null;
      return {
        id: t.id,
        name: t.name,
        // 棚卸しの画面が同じ品番の色違いを見分けるのに使う
        color: t.color,
        quantity: stock?.quantity ?? 0,
        received: stock?.received ?? 0,
        disposed: stock?.disposed ?? 0,
        updatedAt: stock?.updatedAt ?? t.updatedAt,
      };
    });
  }

  /**
   * 受付の記録を取り消す。**在庫は操作の逆を当てて戻す。**
   *
   * 搬入 → 在庫と搬入累計を減らす／持ち出し → 在庫を戻す／
   * 廃棄 → 廃棄累計を減らす。棚卸し調整は「調整前の本数」を持っていないので戻せない。
   *
   * 打ち間違いを消すためのもので、戻した結果が筋の通らない状態になるなら断る
   * （在庫より多い搬入を消す、廃棄済みより搬入累計が少なくなる、など）。
   *
   * 過去の行に残る balance（操作直後の在庫）は取り直さない。
   * あれはその時点の記録なので、後から書き換えると履歴の意味が変わってしまう
   */
  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.tonerEntry.findUnique({
        where: { id },
        include: { toner: { select: { name: true } } },
      });

      if (!entry) {
        throw new NotFoundException(`ID ${id} の記録はありません`);
      }

      if (entry.action === 'ADJUST') {
        throw new UnprocessableEntityException(
          '棚卸しの調整は取り消せません。数え直して棚卸しをやり直してください',
        );
      }

      // 履歴が持っている会社の在庫を戻す。他社の数を動かさないための鍵
      const stockKey = {
        tonerId_companyId: {
          tonerId: entry.tonerId,
          companyId: entry.companyId,
        },
      };

      const stock = await tx.tonerStock.findUnique({ where: stockKey });
      const quantity = stock?.quantity ?? 0;
      const received = stock?.received ?? 0;
      const disposed = stock?.disposed ?? 0;
      const count = entry.quantity;

      if (entry.action === 'RECEIVE') {
        if (quantity < count) {
          throw new UnprocessableEntityException(
            `取り消せません。搬入した ${count} 本のうち ${count - quantity} 本は` +
              `すでに持ち出されています（在庫 ${quantity} 本）`,
          );
        }
        if (received - count < disposed) {
          throw new UnprocessableEntityException(
            `取り消せません。廃棄済み ${disposed} 本が搬入累計を上回ります`,
          );
        }
        await tx.tonerStock.update({
          where: stockKey,
          data: {
            quantity: { decrement: count },
            received: { decrement: count },
          },
        });
      } else if (entry.action === 'ISSUE') {
        await tx.tonerStock.update({
          where: stockKey,
          data: { quantity: { increment: count } },
        });
      } else if (entry.action === 'DISPOSE') {
        await tx.tonerStock.update({
          where: stockKey,
          data: { disposed: { decrement: Math.min(count, disposed) } },
        });
      }
      // REGISTER は在庫を動かしていないので、行を消すだけ

      await tx.tonerEntry.delete({ where: { id } });

      const after = await tx.tonerStock.findUnique({ where: stockKey });

      return {
        id,
        tonerId: entry.tonerId,
        name: entry.toner.name,
        action: entry.action,
        quantity: count,
        /** 取り消したあとの在庫 */
        stock: after?.quantity ?? 0,
        received: after?.received ?? 0,
        disposed: after?.disposed ?? 0,
      };
    });
  }

  /** 履歴（直近 20 件） */
  findRecent() {
    return this.prisma.tonerEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { toner: { select: { name: true } } },
    });
  }

  /**
   * 受付の履歴。入出庫の画面で使う。
   * 既定は直近 60 日。区分・品番で絞れる。
   * 搬入日（receivedOn）は搬入の行だけに入る
   */
  /**
   * 受け払いの履歴。**会社ごと**（トナー入出状況の画面用）。
   * `companyId` を渡さなければ全社まとめて返す
   */
  async findHistory(params: {
    days?: number;
    action?: string;
    tonerId?: string;
    companyId?: number;
  }) {
    const days = params.days && params.days > 0 ? params.days : 60;
    const from = new Date();
    from.setDate(from.getDate() - days);

    const rows = await this.prisma.tonerEntry.findMany({
      where: {
        createdAt: { gte: from },
        ...(params.action ? { action: params.action as TonerAction } : {}),
        ...(params.tonerId ? { tonerId: params.tonerId } : {}),
        ...(params.companyId ? { companyId: params.companyId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
      include: { toner: { select: { name: true, color: true } } },
    });

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      tonerId: row.tonerId,
      /** どの会社の受け払いか。全社で見るときに列として出す */
      companyId: row.companyId,
      name: row.toner.name,
      color: row.toner.color,
      action: row.action,
      quantity: row.quantity,
      /** 操作直後の在庫 */
      balance: row.balance,
      /** 搬入日。搬入以外は null */
      receivedOn: fromDate(row.receivedOn),
      createdAt: row.createdAt,
    }));
  }

  // ── 内部ヘルパー ──────────────────────

  /**
   * 品番を引き、**その会社の在庫行だけ**を添えて返す。
   *
   * 在庫は「品番 × 会社」なので、会社を指定しないと他社の数を掴んでしまう。
   * 行が無いのは在庫 0 と同じ意味なので、無くてもここでは止めない
   */
  private async requireToner(tx: Tx, tonerId: string, companyId: number) {
    const toner = await tx.toner.findUnique({
      where: { id: tonerId },
      include: { stocks: { where: { companyId } } },
    });

    if (!toner) {
      throw new NotFoundException(
        `${tonerId} は未登録です。先に登録を行ってください`,
      );
    }
    return { ...toner, stock: toner.stocks[0] ?? null };
  }

  /**
   * その会社の在庫を動かす。**行が無ければ作る。**
   *
   * 在庫は「品番 × 会社」で、行ができるのは初めて受け入れたとき。
   * 品番を登録した時点では会社が決まらないので、ここで upsert する
   */
  private bumpStock(
    tx: Tx,
    tonerId: string,
    companyId: number,
    delta: { quantity?: number; received?: number; disposed?: number },
  ) {
    return tx.tonerStock.upsert({
      where: { tonerId_companyId: { tonerId, companyId } },
      create: {
        tonerId,
        companyId,
        quantity: delta.quantity ?? 0,
        received: delta.received ?? 0,
        disposed: delta.disposed ?? 0,
      },
      update: {
        ...(delta.quantity === undefined
          ? {}
          : { quantity: { increment: delta.quantity } }),
        ...(delta.received === undefined
          ? {}
          : { received: { increment: delta.received } }),
        ...(delta.disposed === undefined
          ? {}
          : { disposed: { increment: delta.disposed } }),
      },
    });
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
