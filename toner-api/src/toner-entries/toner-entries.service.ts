import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { fromDate, periodOf, timeRange, toDate, today } from '../common/date';
import { PrismaService, Tx } from '../prisma/prisma.service';
import { reconcileOrders } from '../toner-orders/reconcile';
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

/**
 * 受け払い履歴を 1 回で返す上限。
 * これを超えたぶんは返さず、切れたことを `truncated` で画面に伝える。
 * 黙って打ち切ると「その期間はこれで全部」と読めてしまうため
 */
export const HISTORY_LIMIT = 1000;

/** 在庫の増減。渡さなかった列は動かさない */
type StockDelta = { quantity?: number; received?: number; disposed?: number };

/**
 * 在庫の行を増減させる data。**指定の無い列には触らない。**
 * 行を作る側と動かす側で同じ delta を読むので、組み立てはここ 1 か所にする
 */
function increments(delta: StockDelta) {
  return {
    ...(delta.quantity === undefined
      ? {}
      : { quantity: { increment: delta.quantity } }),
    ...(delta.received === undefined
      ? {}
      : { received: { increment: delta.received } }),
    ...(delta.disposed === undefined
      ? {}
      : { disposed: { increment: delta.disposed } }),
  };
}

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
  /**
   * 搬入で本数が一致して、入荷済み（自動）になった注文の件数。搬入のときだけ入る。
   * 画面は知らせに添える（黙ると、注文が未入荷の一覧から消えた理由が分からない）
   */
  ordersReceived?: number;
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
            // 拠点はまとめ単位で 1 つ。1 回の伝票が拠点をまたぐことは無い
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

    // 在庫の行はここでは作らない。「品番 × 拠点」なので、
    // どの拠点の分かは搬入して初めて決まる
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

    // 入力が無ければ受け付けた日。注文の次回搬入日と突き合わせる鍵になる
    const receivedOn = toDate(dto.receivedOn) ?? today();
    await tx.tonerEntry.create({
      data: {
        userId: dto.userId,
        tonerId: dto.tonerId,
        companyId: dto.companyId,
        action: 'RECEIVE',
        quantity: count,
        balance: stock.quantity,
        receivedOn,
      },
    });

    // 同じ拠点・品番・日付の注文と本数が合えば、その注文を入荷済み（自動）にする
    const settled = await reconcileOrders(tx, {
      companyId: dto.companyId,
      tonerId: dto.tonerId,
      date: receivedOn,
    });

    return {
      ...this.toResult(toner.id, toner.name, 'RECEIVE', count, stock),
      ordersReceived: settled.received,
    };
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

    const stock = await this.stepStock(tx, dto.tonerId, dto.companyId, {
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

    const stock = await this.stepStock(tx, dto.tonerId, dto.companyId, {
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
        // 在庫は「品番 × 拠点」。この拠点の行だけを見て合わせる
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
   * 在庫の一覧。**拠点ごと。** 棚卸しと受付の候補がここから作られる。
   *
   * 品番マスタは全拠点共通なので、行はどの拠点でも同じ数だけ並ぶ。
   * その拠点で一度も受け入れていない品番は在庫の行が無く、0 本として出る。
   *
   * **他の画面に出さない品番（hidden）は、この拠点に在庫が無ければ外す。**
   * 価格を比べるためだけに登録した純正などで、数える物が無い。
   * 在庫が残っていれば出す（隠すと棚卸しで数え漏れる）
   */
  async findStock(companyId: number) {
    const found = await this.prisma.toner.findMany({
      include: { stocks: { where: { companyId } } },
      orderBy: { id: 'asc' },
    });
    const toners = found.filter(
      (t) => !t.hidden || (t.stocks[0]?.quantity ?? 0) > 0,
    );

    return toners.map((t) => {
      // 拠点で絞ってあるので 0 件か 1 件
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

      // 履歴が持っている拠点の在庫を戻す。他の拠点の数を動かさないための鍵
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
        /*
         * 廃棄累計より多く戻そうとするのは、履歴と在庫が食い違っている合図。
         * 以前は Math.min で黙って辻褄を合わせていたが、それだと
         * 取り消したはずの本数が戻らないまま「成功」として返ってしまう。
         * 搬入の取り消しと同じく、筋が通らないなら断る
         */
        if (disposed < count) {
          throw new UnprocessableEntityException(
            `取り消せません。廃棄した ${count} 本に対して、` +
              `記録上の廃棄累計は ${disposed} 本しかありません`,
          );
        }
        await tx.tonerStock.update({
          where: stockKey,
          data: { disposed: { decrement: count } },
        });
      }
      // REGISTER は在庫を動かしていないので、行を消すだけ

      await tx.tonerEntry.delete({ where: { id } });

      /*
       * 搬入を取り消すと、その日の注文と本数が合わなくなることがある。
       * 自動で入荷済みにしていた注文はそのとき未入荷に戻す（手動のものは戻さない）
       */
      const reopened =
        entry.action === 'RECEIVE'
          ? (
              await reconcileOrders(tx, {
                companyId: entry.companyId,
                tonerId: entry.tonerId,
                date: entry.receivedOn,
              })
            ).reopened
          : 0;

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
        /** 搬入を取り消したことで未入荷に戻った注文の件数 */
        ordersReopened: reopened,
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
   * 受け払いの履歴（トナー入出状況の画面用。画面は全拠点を並べ、拠点を列に出す）。
   * `companyId` を渡せばその拠点の分だけ、渡さなければ全拠点まとめて返す。
   * 期間は受付日時（createdAt）で絞る。from / to（YYYY-MM-DD）があればその範囲、
   * 無ければ直近 days 日（`periodOf`）。
   *
   * 1 回に返すのは新しいほうから `HISTORY_LIMIT` 件まで。
   * **切れたときは `truncated` を立てて返す。** 黙って打ち切ると
   * 画面に並んだものがその期間の全部だと読めてしまうため
   */
  async findHistory(params: {
    days?: number;
    from?: string;
    to?: string;
    action?: string;
    tonerId?: string;
    companyId?: number;
  }) {
    const days = params.days && params.days > 0 ? params.days : 60;
    const period = periodOf(days, params.from, params.to);

    const found = await this.prisma.tonerEntry.findMany({
      where: {
        createdAt: timeRange(period),
        ...(params.action ? { action: params.action as TonerAction } : {}),
        ...(params.tonerId ? { tonerId: params.tonerId } : {}),
        ...(params.companyId ? { companyId: params.companyId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      // 上限より 1 件多く引いて、続きがあるかどうかだけ見る
      take: HISTORY_LIMIT + 1,
      include: {
        toner: { select: { name: true, color: true } },
        // 画面の拠点一覧は有効なものだけなので、無効にした拠点の名前もここで引く
        company: { select: { name: true } },
      },
    });

    const truncated = found.length > HISTORY_LIMIT;
    const rows = truncated ? found.slice(0, HISTORY_LIMIT) : found;

    return {
      /** 上限に達したか。立っていれば画面は「以降は表示していない」と出す */
      truncated,
      limit: HISTORY_LIMIT,
      rows: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        tonerId: row.tonerId,
        /** どの拠点の受け払いか。全拠点で見るときに列として出す */
        companyId: row.companyId,
        companyName: row.company.name,
        name: row.toner.name,
        color: row.toner.color,
        action: row.action,
        quantity: row.quantity,
        /** 操作直後の在庫 */
        balance: row.balance,
        /** 搬入日。搬入以外は null */
        receivedOn: fromDate(row.receivedOn),
        createdAt: row.createdAt,
      })),
    };
  }

  // ── 内部ヘルパー ──────────────────────

  /**
   * 品番を引き、**その拠点の在庫行だけ**を添えて返す。
   *
   * 在庫は「品番 × 拠点」なので、拠点を指定しないと他の拠点の数を掴んでしまう。
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
   * その拠点の在庫を増やす。**行が無ければ作る。搬入だけが通る道。**
   *
   * 在庫は「品番 × 拠点」で、行ができるのは初めて受け入れたとき。
   * 品番を登録した時点では拠点が決まらないので、ここで upsert する。
   *
   * **減らす操作をここに通さないこと。** 理由は `stepStock` を参照
   */
  private bumpStock(
    tx: Tx,
    tonerId: string,
    companyId: number,
    delta: StockDelta,
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
      update: increments(delta),
    });
  }

  /**
   * すでにある在庫の行を動かす。**持ち出しと廃棄はこちら。**
   *
   * upsert を使わない。Prisma の upsert は
   * `INSERT ... ON CONFLICT DO UPDATE` になるが、**PostgreSQL は
   * 挿入しようとした行にも CHECK 制約を当てる。**行が既にあって update に
   * 進む場合でも、先に create 側の値が検査される。
   * 持ち出しの create は `quantity: -N`、廃棄の create は
   * `disposed: N` に対して `received: 0` なので、
   * `toner_stocks_quantity_non_negative` と
   * `toner_stocks_disposed_within_received` に必ず引っかかり、
   * **在庫が足りていても 500 になる**（実際に持ち出しと廃棄が全て落ちていた）。
   *
   * 行が無いときは呼び出し側が先に 422 で断っている
   * （在庫 0 からは持ち出せず、搬入 0 本からは廃棄できない）ので、
   * ここに来る時点で行は必ずある。update で足りる
   */
  private stepStock(
    tx: Tx,
    tonerId: string,
    companyId: number,
    delta: StockDelta,
  ) {
    return tx.tonerStock.update({
      where: { tonerId_companyId: { tonerId, companyId } },
      data: increments(delta),
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
