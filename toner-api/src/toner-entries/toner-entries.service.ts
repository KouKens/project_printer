import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerEntryDto } from './dto/create-toner-entry.dto';

export type TonerAction = 'REGISTER' | 'RECEIVE' | 'ISSUE' | 'DISPOSE';

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
    switch (dto.action) {
      case 'REGISTER':
        return this.register(dto);
      case 'RECEIVE':
        return this.receive(dto);
      case 'ISSUE':
        return this.issue(dto);
      case 'DISPOSE':
        return this.dispose(dto);
    }
  }

  /** 登録：マスタに品番を追加し、在庫を 0 で作る */
  private register(dto: CreateTonerEntryDto): Promise<EntryResult> {
    return this.prisma.$transaction(async (tx) => {
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
    });
  }

  /** 搬入：在庫と搬入累計を増やす */
  private receive(dto: CreateTonerEntryDto): Promise<EntryResult> {
    const count = dto.quantity ?? 1;

    return this.prisma.$transaction(async (tx) => {
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
    });
  }

  /** 持ち出し：在庫を減らす。在庫を超える本数は受け付けない */
  private issue(dto: CreateTonerEntryDto): Promise<EntryResult> {
    const count = dto.quantity ?? 1;

    return this.prisma.$transaction(async (tx) => {
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
    });
  }

  /**
   * 廃棄：廃棄累計を増やす。
   * 廃棄累計は搬入累計を超えられない（搬入していない本数は廃棄できない）。
   * 現在庫は変えない。棚にある未使用品を捨てる運用なら
   * data に quantity: { decrement: count } を足し、在庫チェックを加える。
   */
  private dispose(dto: CreateTonerEntryDto): Promise<EntryResult> {
    const count = dto.quantity ?? 1;

    return this.prisma.$transaction(async (tx) => {
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

  private async requireToner(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    tonerId: string,
  ) {
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
