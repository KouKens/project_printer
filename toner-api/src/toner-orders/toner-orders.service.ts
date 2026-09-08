import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fromDate, toDate, today } from '../common/date';
import { PrismaService } from '../prisma/prisma.service';
import { BulkTonerOrderDto } from './dto/bulk-toner-order.dto';
import { CreateTonerOrderDto } from './dto/create-toner-order.dto';

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
  toner: { name: string | null };
}) {
  return {
    id: order.id,
    tonerId: order.tonerId,
    /** どの拠点の注文か。注文・搬入は拠点ごとに見る */
    companyId: order.companyId,
    /** 注文した人。この列を足す前の注文は null */
    userId: order.userId,
    name: order.toner.name,
    quantity: order.quantity,
    orderedAt: order.orderedAt,
    /** 次回搬入日。未定なら null */
    deliveryOn: fromDate(order.deliveryOn),
    status: order.status,
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

    const order = await this.prisma.tonerOrder.create({
      data: {
        tonerId: dto.tonerId,
        companyId: dto.companyId,
        userId: dto.userId ?? null,
        quantity: dto.quantity,
        orderedAt,
        deliveryOn: toDate(dto.deliveryOn),
      },
      include: { toner: { select: { name: true } } },
    });

    return toResponse(order);
  }

  /** 未入荷の注文。古いものから並べる */
  async findPending(companyId?: number) {
    const orders = await this.prisma.tonerOrder.findMany({
      where: { status: 'PENDING', ...(companyId ? { companyId } : {}) },
      orderBy: { orderedAt: 'asc' },
      include: { toner: { select: { name: true } } },
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
      const saved: ReturnType<typeof toResponse>[] = [];
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
          include: { toner: { select: { name: true } } },
        });
        saved.push(toResponse(order));
      }
      return saved;
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
   * **拠点ごと。`companyId` は必須。** 鍵が「品番 ＋ 日付」だけなので、
   * 拠点で絞らないと同じ品番を同じ日に受け取った別の拠点の搬入が
   * 1 行にまとまり、こちらの注文が埋まったように見えて差が消える
   */
  async findDeliveryCheck(companyId: number, days = 180) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const [orders, entries] = await Promise.all([
      this.prisma.tonerOrder.findMany({
        where: { companyId, orderedAt: { gte: from } },
        orderBy: { orderedAt: 'desc' },
        include: { toner: { select: { name: true, color: true } } },
      }),
      this.prisma.tonerEntry.findMany({
        where: { companyId, action: 'RECEIVE', createdAt: { gte: from } },
        orderBy: { createdAt: 'desc' },
        include: { toner: { select: { name: true, color: true } } },
      }),
    ]);

    type Row = {
      key: string;
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
      }[];
      entries: {
        id: number;
        quantity: number;
        userId: string;
        createdAt: Date;
      }[];
    };

    const rows = new Map<string, Row>();
    const rowFor = (
      tonerId: string,
      toner: { name: string | null; color: string | null },
      date: string | null,
    ) => {
      // 区切りは \0。品番に現れない文字なので、日付との境目が動かない
      const key = `${tonerId}\0${date ?? ''}`;
      const row = rows.get(key) ?? {
        key,
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
      const row = rowFor(
        order.tonerId,
        order.toner,
        fromDate(order.deliveryOn),
      );
      // 取り消した注文は本数に数えない。行には残して経緯が分かるようにする
      if (order.status !== 'CANCELED') row.ordered += order.quantity;
      row.orders.push({
        id: order.id,
        quantity: order.quantity,
        orderedAt: order.orderedAt,
        status: order.status,
      });
    }

    for (const entry of entries) {
      const row = rowFor(
        entry.tonerId,
        entry.toner,
        fromDate(entry.receivedOn),
      );
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
        // 日付の新しい順。日付なしは末尾
        if (a.date === b.date) return a.tonerId.localeCompare(b.tonerId, 'ja');
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
    const order = await this.prisma.tonerOrder.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`ID ${id} の注文はありません`);
    }

    await this.prisma.tonerOrder.delete({ where: { id } });
    return { id, tonerId: order.tonerId, quantity: order.quantity };
  }

  /** 注文履歴（直近 50 件） */
  async findAll(companyId?: number) {
    const orders = await this.prisma.tonerOrder.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { orderedAt: 'desc' },
      take: 50,
      include: { toner: { select: { name: true } } },
    });
    return orders.map(toResponse);
  }
}
