import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fromDate, toDate, today } from '../common/date';
import { PrismaService } from '../prisma/prisma.service';
import { BulkTonerOrderDto } from './dto/bulk-toner-order.dto';
import { CreateTonerOrderDto } from './dto/create-toner-order.dto';
import { reconcileOrders } from './reconcile';

/** 未来の日付をどこまで許すか（時計ずれの吸収用に 1 日だけ見る） */
const FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000;

/**
 * 突き合わせの状態。
 * 注文だけあって搬入がまだの行は、予定日が来ているかどうかで意味が変わる。
 * 予定日前なら「待ち」、過ぎていれば「足りない」として色を付ける
 */
function statusOf(
  ordered: number,
  received: number,
  date: string | null,
  todayKey: string | null,
): 'match' | 'short' | 'over' | 'no-order' | 'waiting' | 'undated' {
  if (ordered === 0) return 'no-order';
  if (date === null) return 'undated';
  if (received === 0 && todayKey !== null && date > todayKey) return 'waiting';
  if (received === ordered) return 'match';
  return received < ordered ? 'short' : 'over';
}

/**
 * 注文に添えるもの。拠点名は、全拠点を並べるトナー入出状況が列に出す。
 * 画面が持っている拠点の一覧は有効なものだけなので、名前はこちらで引いて渡す
 * （無効にした拠点の注文だと、画面では名前が引けない）
 */
const ORDER_INCLUDE = {
  toner: { select: { name: true } },
  company: { select: { name: true } },
} as const;

/** 注文 1 件を画面が使う形に */
function toResponse(order: {
  id: number;
  tonerId: string;
  companyId: number;
  userId: string | null;
  quantity: number;
  orderedAt: Date;
  deliveryOn: Date | null;
  status: string;
  receivedAt: Date | null;
  receiveMode: 'AUTO' | 'MANUAL' | null;
  toner: { name: string | null };
  company: { name: string };
}) {
  return {
    id: order.id,
    tonerId: order.tonerId,
    /** どの拠点の注文か */
    companyId: order.companyId,
    companyName: order.company.name,
    /** 注文した人。この列を足す前の注文は null */
    userId: order.userId,
    name: order.toner.name,
    quantity: order.quantity,
    orderedAt: order.orderedAt,
    /** 次回搬入日。未定なら null */
    deliveryOn: fromDate(order.deliveryOn),
    status: order.status,
    /** 入荷済みにした日時。未入荷なら null */
    receivedAt: order.receivedAt,
    /** 入荷済みにした方法（AUTO = 搬入と一致 / MANUAL = 手動）。未入荷なら null */
    receiveMode: order.receiveMode,
  };
}

@Injectable()
export class TonerOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /** 注文日時の読み取り。形式と未来日をここで弾く */
  private parseOrderedAt(value: string): Date {
    const orderedAt = new Date(value);

    if (Number.isNaN(orderedAt.getTime())) {
      throw new BadRequestException('注文日時の形式が正しくありません');
    }

    if (orderedAt.getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
      throw new BadRequestException('注文日時に未来の日付は指定できません');
    }
    return orderedAt;
  }

  async create(dto: CreateTonerOrderDto) {
    const orderedAt = this.parseOrderedAt(dto.orderedAt);

    const toner = await this.prisma.toner.findUnique({
      where: { id: dto.tonerId },
    });

    if (!toner) {
      throw new NotFoundException(
        `${dto.tonerId} は未登録です。先に登録を行ってください`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.tonerOrder.create({
        data: {
          tonerId: dto.tonerId,
          companyId: dto.companyId,
          userId: dto.userId ?? null,
          quantity: dto.quantity,
          orderedAt,
          deliveryOn: toDate(dto.deliveryOn),
        },
      });

      /*
       * 搬入を先に受け付けてから注文を入れることもある（届いてから記録を起こす）。
       * そのときは入れた時点で本数が合うので、ここで入荷済みにする
       */
      await reconcileOrders(tx, {
        companyId: order.companyId,
        tonerId: order.tonerId,
        date: order.deliveryOn,
      });

      return toResponse(
        await tx.tonerOrder.findUniqueOrThrow({
          where: { id: order.id },
          include: ORDER_INCLUDE,
        }),
      );
    });
  }

  /** 未入荷の注文。古いものから並べる */
  async findPending(companyId?: number) {
    const orders = await this.prisma.tonerOrder.findMany({
      where: { status: 'PENDING', ...(companyId ? { companyId } : {}) },
      orderBy: { orderedAt: 'asc' },
      include: ORDER_INCLUDE,
    });
    return orders.map(toResponse);
  }

  /**
   * まとめて注文する。**1 件でも通らなければ全体を取り消す。**
   * 受付のまとめ処理と同じで、半分だけ登録された状態を作らないため。
   */
  async bulk(dto: BulkTonerOrderDto) {
    const orderedAt = this.parseOrderedAt(dto.orderedAt);
    const deliveryOn = toDate(dto.deliveryOn);

    // 先に全件そろっているか確かめる。1 件ずつ作ってから落ちるのを避ける
    const ids = [...new Set(dto.items.map((item) => item.tonerId))];
    const found = await this.prisma.toner.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const registered = new Set(found.map((row) => row.id));
    const missing = ids.filter((id) => !registered.has(id));
    if (missing.length > 0) {
      throw new NotFoundException(
        `${missing.join(', ')} は未登録です。先に登録を行ってください`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const ids: number[] = [];
      for (const item of dto.items) {
        const order = await tx.tonerOrder.create({
          data: {
            tonerId: item.tonerId,
            companyId: dto.companyId,
            userId: dto.userId ?? null,
            quantity: item.quantity,
            orderedAt,
            deliveryOn,
          },
        });
        ids.push(order.id);
      }

      // 全部入れてから品番ごとに 1 回。途中で決めると、同じ品番の 2 行目で数が変わる
      for (const tonerId of new Set(dto.items.map((item) => item.tonerId))) {
        await reconcileOrders(tx, {
          companyId: dto.companyId,
          tonerId,
          date: deliveryOn,
        });
      }

      const saved = await tx.tonerOrder.findMany({
        where: { id: { in: ids } },
        orderBy: { id: 'asc' },
        include: ORDER_INCLUDE,
      });
      return saved.map(toResponse);
    });
  }

  /**
   * 注文を手動で入荷済みにする。**トナー入出状況で一致しなかった行のためのもの。**
   *
   * 搬入の記録と本数が合わないまま届いたことにする（業者が分けて送ってきて
   * 残りは取り消した、搬入日を違う日で受け付けた、次回搬入日を入れずに注文した、など）。
   * 一致した行は搬入を受け付けた時点で自動で入荷済みになっているので、ここには来ない。
   *
   * 未入荷のものだけを受け付ける。1 件でも未入荷でなければ全体を断る
   * （画面が古い状態のまま押したときに、何が起きたか分からなくなるため）
   */
  async receive(ids: number[]) {
    return this.prisma.$transaction(async (tx) => {
      const orders = await tx.tonerOrder.findMany({
        where: { id: { in: ids } },
        select: { id: true, tonerId: true, status: true },
      });

      const found = new Set(orders.map((order) => order.id));
      const missing = ids.filter((id) => !found.has(id));
      if (missing.length > 0) {
        throw new NotFoundException(
          `ID ${missing.join(', ')} の注文はありません`,
        );
      }

      const notPending = orders.filter((order) => order.status !== 'PENDING');
      if (notPending.length > 0) {
        throw new BadRequestException(
          `${notPending.map((order) => order.tonerId).join(', ')} の注文は` +
            'すでに入荷済みか取り消し済みです。画面を開き直してください',
        );
      }

      await tx.tonerOrder.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'RECEIVED',
          receiveMode: 'MANUAL',
          receivedAt: new Date(),
        },
      });

      const saved = await tx.tonerOrder.findMany({
        where: { id: { in: ids } },
        orderBy: { id: 'asc' },
        include: ORDER_INCLUDE,
      });
      return saved.map(toResponse);
    });
  }

  /**
   * 手動で入荷済みにした注文を未入荷に戻す。押し間違えの後始末。
   *
   * **自動で入荷済みになったものは戻せない。** 搬入の記録と本数が合っているので、
   * 戻してもすぐ入荷済みに決め直される。戻したいなら搬入の記録を取り消す
   * （取り消せば自動で未入荷に戻る）。
   *
   * 戻したあとに突き合わせを決め直すので、その後に搬入が揃っていれば
   * 自動の入荷済みになる。戻り値の status でそれが分かる
   */
  async unreceive(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.tonerOrder.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException(`ID ${id} の注文はありません`);
      }
      if (order.status !== 'RECEIVED') {
        throw new BadRequestException(
          `${order.tonerId} の注文は入荷済みではありません`,
        );
      }
      if (order.receiveMode !== 'MANUAL') {
        throw new BadRequestException(
          `${order.tonerId} の注文は搬入の記録と本数が一致して入荷済みになっているので、` +
            '未入荷に戻せません。戻すには搬入の記録を取り消してください',
        );
      }

      await tx.tonerOrder.update({
        where: { id },
        data: { status: 'PENDING', receiveMode: null, receivedAt: null },
      });
      await reconcileOrders(tx, {
        companyId: order.companyId,
        tonerId: order.tonerId,
        date: order.deliveryOn,
      });

      return toResponse(
        await tx.tonerOrder.findUniqueOrThrow({
          where: { id },
          include: ORDER_INCLUDE,
        }),
      );
    });
  }

  /**
   * 注文と搬入の突き合わせ。
   *
   * **鍵は「品番 ＋ 日付」**。注文の次回搬入日（deliveryOn）と
   * 搬入の搬入日（receivedOn）が同じ日のものを 1 行にまとめ、本数を比べる。
   *
   * 片側しか無い行も出す。注文だけなら「まだ入っていない」、
   * 搬入だけなら「注文の記録が無い」で、どちらも見落としたくないため。
   * 次回搬入日を入れていない注文は突き合わせられないので、日付なしの行にまとめる。
   *
   * **拠点も鍵に入れる（拠点 ＋ 品番 ＋ 日付）。** 入れないと、同じ品番を同じ日に
   * 受け取った別の拠点の搬入が 1 行にまとまり、こちらの注文が埋まったように見えて
   * 差が消える。鍵に入っているので、`companyId` を省いて全拠点を返しても混ざらない
   * （トナー入出状況は全拠点を並べ、拠点を列に出す）。渡せばその拠点の分だけ
   */
  async findDeliveryCheck(companyId?: number, days = 180) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const include = {
      toner: { select: { name: true, color: true } },
      company: { select: { name: true, sortOrder: true } },
    } as const;
    const [orders, entries] = await Promise.all([
      this.prisma.tonerOrder.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          orderedAt: { gte: from },
        },
        orderBy: { orderedAt: 'desc' },
        include,
      }),
      this.prisma.tonerEntry.findMany({
        where: {
          ...(companyId ? { companyId } : {}),
          action: 'RECEIVE',
          createdAt: { gte: from },
        },
        orderBy: { createdAt: 'desc' },
        include,
      }),
    ]);

    type Row = {
      key: string;
      companyId: number;
      companyName: string;
      tonerId: string;
      name: string | null;
      color: string | null;
      /** 突き合わせの日付。次回搬入日を入れていない注文は null */
      date: string | null;
      ordered: number;
      received: number;
      orders: {
        id: number;
        quantity: number;
        orderedAt: Date;
        status: string;
        receivedAt: Date | null;
        receiveMode: 'AUTO' | 'MANUAL' | null;
      }[];
      entries: {
        id: number;
        quantity: number;
        userId: string;
        createdAt: Date;
      }[];
    };

    const rows = new Map<string, Row>();
    /** 拠点の並び順。同じ日付の行を拠点登録の順に並べる */
    const companyOrder = new Map<number, number>();
    const rowFor = (
      source: {
        companyId: number;
        company: { name: string; sortOrder: number };
        tonerId: string;
        toner: { name: string | null; color: string | null };
      },
      date: string | null,
    ) => {
      const { companyId: company, tonerId, toner } = source;
      companyOrder.set(company, source.company.sortOrder);
      // 区切りは \0。品番に現れない文字なので、拠点・日付との境目が動かない
      const key = `${company}\0${tonerId}\0${date ?? ''}`;
      const row = rows.get(key) ?? {
        key,
        companyId: company,
        companyName: source.company.name,
        tonerId,
        name: toner.name,
        color: toner.color,
        date,
        ordered: 0,
        received: 0,
        orders: [],
        entries: [],
      };
      rows.set(key, row);
      return row;
    };

    for (const order of orders) {
      const row = rowFor(order, fromDate(order.deliveryOn));
      // 取り消した注文は本数に数えない。行には残して経緯が分かるようにする
      if (order.status !== 'CANCELED') row.ordered += order.quantity;
      row.orders.push({
        id: order.id,
        quantity: order.quantity,
        orderedAt: order.orderedAt,
        status: order.status,
        receivedAt: order.receivedAt,
        receiveMode: order.receiveMode,
      });
    }

    for (const entry of entries) {
      const row = rowFor(entry, fromDate(entry.receivedOn));
      row.received += entry.quantity;
      row.entries.push({
        id: entry.id,
        quantity: entry.quantity,
        userId: entry.userId,
        createdAt: entry.createdAt,
      });
    }

    const todayKey = fromDate(today());

    return [...rows.values()]
      .map((row) => ({
        ...row,
        /** まだ未入荷の注文。画面の「入荷済みにする」が送る先 */
        pendingOrderIds: row.orders
          .filter((order) => order.status === 'PENDING')
          .map((order) => order.id),
        /**
         * 片付いた行か。注文があり、どれも未入荷でない（入荷済みか取消）。
         * 数が合わないまま手動で入荷済みにした行は、人が確かめたものとして
         * 「数の合わない行」に数えない
         */
        settled:
          row.orders.some((order) => order.status === 'RECEIVED') &&
          row.orders.every((order) => order.status !== 'PENDING'),
        diff: row.received - row.ordered,
        /**
         * match  = 本数が合っている
         * short  = 注文より少ない（まだ届いていない・欠品）
         * over   = 注文より多い
         * no-order = 注文の記録が無い搬入
         * waiting  = 次回搬入日がまだ来ていない注文
         * undated  = 次回搬入日を入れていない注文（突き合わせできない）
         */
        status: statusOf(row.ordered, row.received, row.date, todayKey),
      }))
      .sort((a, b) => {
        // 日付の新しい順。日付なしは末尾。同じ日付は拠点登録の並び順 → 品番
        if (a.date === b.date) {
          return (
            (companyOrder.get(a.companyId) ?? 0) -
              (companyOrder.get(b.companyId) ?? 0) ||
            a.companyId - b.companyId ||
            a.tonerId.localeCompare(b.tonerId, 'ja')
          );
        }
        if (a.date === null) return 1;
        if (b.date === null) return -1;
        return a.date < b.date ? 1 : -1;
      });
  }

  /**
   * 注文を取り消す。**行ごと消す。**
   * 注文は在庫を動かしていないので、消しても在庫には影響しない。
   * 搬入の記録とは独立しているため、突き合わせの「注文」側だけが減る
   */
  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.tonerOrder.findUnique({ where: { id } });
      if (!order) {
        throw new NotFoundException(`ID ${id} の注文はありません`);
      }

      await tx.tonerOrder.delete({ where: { id } });

      // 同じ日の残りの注文が、この 1 件が抜けたことで搬入と合う（または合わなくなる）
      await reconcileOrders(tx, {
        companyId: order.companyId,
        tonerId: order.tonerId,
        date: order.deliveryOn,
      });

      return { id, tonerId: order.tonerId, quantity: order.quantity };
    });
  }

  /** 注文履歴（直近 50 件） */
  async findAll(companyId?: number) {
    const orders = await this.prisma.tonerOrder.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { orderedAt: 'desc' },
      take: 50,
      include: ORDER_INCLUDE,
    });
    return orders.map(toResponse);
  }
}
