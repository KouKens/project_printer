import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerOrderDto } from './dto/create-toner-order.dto';

/** 未来の日付をどこまで許すか（時計ずれの吸収用に 1 日だけ見る） */
const FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class TonerOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTonerOrderDto) {
    const orderedAt = new Date(dto.orderedAt);

    if (Number.isNaN(orderedAt.getTime())) {
      throw new BadRequestException('注文日時の形式が正しくありません');
    }

    if (orderedAt.getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
      throw new BadRequestException('注文日時に未来の日付は指定できません');
    }

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
        quantity: dto.quantity,
        orderedAt,
      },
      include: { toner: { select: { name: true } } },
    });

    return {
      id: order.id,
      tonerId: order.tonerId,
      name: order.toner.name,
      quantity: order.quantity,
      orderedAt: order.orderedAt,
      status: order.status,
    };
  }

  /** 未入荷の注文。古いものから並べる */
  findPending() {
    return this.prisma.tonerOrder.findMany({
      where: { status: 'PENDING' },
      orderBy: { orderedAt: 'asc' },
      include: { toner: { select: { name: true } } },
    });
  }

  /** 注文履歴（直近 50 件） */
  findAll() {
    return this.prisma.tonerOrder.findMany({
      orderBy: { orderedAt: 'desc' },
      take: 50,
      include: { toner: { select: { name: true } } },
    });
  }
}
