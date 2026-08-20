import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerPriceDto } from './dto/create-toner-price.dto';
import { CreateTonerDto } from './dto/create-toner.dto';
import { UpdateTonerDto } from './dto/update-toner.dto';

/**
 * @db.Date の列にローカル 0 時の Date を渡すと JST では前日にずれる。
 * UTC 成分しか見られないので、UTC の 0 時で作る。
 */
function toDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** 読むときも UTC 成分で取り出す。画面の <input type="date"> にそのまま入る形 */
function fromDate(value: Date): string {
  const month = `${value.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${value.getUTCDate()}`.padStart(2, '0');
  return `${value.getUTCFullYear()}-${month}-${day}`;
}

/** 今日をローカルの暦日で。UTC 0 時に揃えて @db.Date と比べられる形にする */
function today(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** 空文字は未入力として扱う。画面から '' が来ても null で揃える */
function toText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type PriceRow = { price: number; effectiveFrom: Date; note: string | null };

@Injectable()
export class TonersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * マスタを登録する。
   * 在庫の行も同時に作る。受付画面の搬入・持ち出しが在庫を前提にしているため。
   */
  async create(dto: CreateTonerDto) {
    const id = dto.id.trim();

    const exists = await this.prisma.toner.findUnique({ where: { id } });
    if (exists) {
      throw new ConflictException(`${id} はすでに登録されています`);
    }

    await this.assertAssetsExist(dto.printerAssetIds ?? []);

    await this.prisma.$transaction(async (tx) => {
      await tx.toner.create({
        data: {
          id,
          name: toText(dto.name),
          color: toText(dto.color),
          recycled: dto.recycled ?? false,
          stock: { create: {} },
          printers: {
            create: (dto.printerAssetIds ?? []).map((printerAssetId) => ({
              printerAssetId,
            })),
          },
        },
      });

      if (dto.price !== undefined && dto.price !== null) {
        await tx.tonerPrice.create({
          data: {
            tonerId: id,
            price: dto.price,
            effectiveFrom: dto.effectiveFrom
              ? toDate(dto.effectiveFrom)
              : today(),
          },
        });
      }
    });

    return this.findOne(id);
  }

  async findAll() {
    const toners = await this.prisma.toner.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      include: {
        stock: true,
        prices: { orderBy: { effectiveFrom: 'desc' } },
        printers: {
          include: {
            asset: {
              select: {
                id: true,
                department: true,
                no: true,
                ipAddress: true,
                maker: true,
                model: true,
              },
            },
          },
        },
      },
    });

    return toners.map((toner) => this.toResponse(toner));
  }

  async findOne(id: string) {
    const toner = await this.prisma.toner.findUnique({
      where: { id },
      include: {
        stock: true,
        prices: { orderBy: { effectiveFrom: 'desc' } },
        printers: {
          include: {
            asset: {
              select: {
                id: true,
                department: true,
                no: true,
                ipAddress: true,
                maker: true,
                model: true,
              },
            },
          },
        },
      },
    });

    if (!toner) {
      throw new NotFoundException(`${id} は登録されていません`);
    }
    return this.toResponse(toner);
  }

  /** 名前・色・リサイクル区分と対応機器を更新する。価格は addPrice で足す */
  async update(id: string, dto: UpdateTonerDto) {
    const toner = await this.prisma.toner.findUnique({ where: { id } });
    if (!toner) {
      throw new NotFoundException(`${id} は登録されていません`);
    }

    if (dto.printerAssetIds !== undefined) {
      await this.assertAssetsExist(dto.printerAssetIds);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.toner.update({
        where: { id },
        data: {
          name: dto.name === undefined ? undefined : toText(dto.name),
          color: dto.color === undefined ? undefined : toText(dto.color),
          recycled: dto.recycled,
        },
      });

      // 渡された配列がそのまま対応機器になる。差分ではなく入れ替える
      if (dto.printerAssetIds !== undefined) {
        await tx.tonerPrinter.deleteMany({ where: { tonerId: id } });
        if (dto.printerAssetIds.length > 0) {
          await tx.tonerPrinter.createMany({
            data: dto.printerAssetIds.map((printerAssetId) => ({
              tonerId: id,
              printerAssetId,
            })),
          });
        }
      }
    });

    return this.findOne(id);
  }

  /**
   * 価格改定。過去の行は消さずに足す。
   * 同じ適用開始日が既にあるときは、打ち間違いの入れ直しとみなして上書きする。
   */
  async addPrice(id: string, dto: CreateTonerPriceDto) {
    const toner = await this.prisma.toner.findUnique({ where: { id } });
    if (!toner) {
      throw new NotFoundException(`${id} は登録されていません`);
    }

    const effectiveFrom = dto.effectiveFrom
      ? toDate(dto.effectiveFrom)
      : today();

    await this.prisma.tonerPrice.upsert({
      where: { tonerId_effectiveFrom: { tonerId: id, effectiveFrom } },
      create: {
        tonerId: id,
        price: dto.price,
        effectiveFrom,
        note: toText(dto.note),
      },
      update: { price: dto.price, note: toText(dto.note) },
    });

    return this.findOne(id);
  }

  /** 価格の履歴。新しい順 */
  async findPrices(id: string) {
    const toner = await this.prisma.toner.findUnique({
      where: { id },
      include: { prices: { orderBy: { effectiveFrom: 'desc' } } },
    });

    if (!toner) {
      throw new NotFoundException(`${id} は登録されていません`);
    }

    return toner.prices.map((row) => ({
      id: row.id,
      price: row.price,
      effectiveFrom: fromDate(row.effectiveFrom),
      note: row.note,
      createdAt: row.createdAt,
    }));
  }

  /**
   * 指定した日に有効だった税別価格。統計はこれで引く。
   * その日以前で最も新しい行を採る。まだ価格を登録していない期間は null。
   */
  async priceAt(id: string, date: string): Promise<number | null> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException(
        '日付は YYYY-MM-DD の形式で指定してください',
      );
    }

    const row = await this.prisma.tonerPrice.findFirst({
      where: { tonerId: id, effectiveFrom: { lte: toDate(date) } },
      orderBy: { effectiveFrom: 'desc' },
    });

    return row?.price ?? null;
  }

  // ── 内部ヘルパー ──────────────────────

  /** 存在しない台帳 ID を弾く。外部キー違反を 500 で返さないため */
  private async assertAssetsExist(assetIds: number[]) {
    if (assetIds.length === 0) return;

    const found = await this.prisma.printerAsset.findMany({
      where: { id: { in: assetIds } },
      select: { id: true },
    });

    const missing = assetIds.filter(
      (id) => !found.some((asset) => asset.id === id),
    );
    if (missing.length > 0) {
      throw new BadRequestException(
        `端末情報に無いプリンターが指定されています（ID ${missing.join(', ')}）`,
      );
    }
  }

  /** 今日の時点で有効な価格。履歴は新しい順に入っている前提 */
  private currentPrice(prices: PriceRow[]): PriceRow | null {
    const now = today();
    return prices.find((row) => row.effectiveFrom <= now) ?? null;
  }

  private toResponse(toner: {
    id: string;
    name: string | null;
    color: string | null;
    recycled: boolean;
    createdAt: Date;
    updatedAt: Date;
    stock: { quantity: number } | null;
    prices: (PriceRow & { id: number; createdAt: Date })[];
    printers: {
      asset: {
        id: number;
        department: string | null;
        no: string | null;
        ipAddress: string | null;
        maker: string | null;
        model: string | null;
      };
    }[];
  }) {
    const current = this.currentPrice(toner.prices);

    return {
      id: toner.id,
      name: toner.name,
      color: toner.color,
      recycled: toner.recycled,
      /** 今日の時点の税別価格。まだ登録が無ければ null */
      price: current?.price ?? null,
      priceFrom: current ? fromDate(current.effectiveFrom) : null,
      /** 改定の回数が分かるように件数だけ添える */
      priceCount: toner.prices.length,
      stock: toner.stock?.quantity ?? 0,
      printers: toner.printers.map((link) => ({
        id: link.asset.id,
        department: link.asset.department,
        no: link.asset.no,
        ipAddress: link.asset.ipAddress,
        maker: link.asset.maker,
        model: link.asset.model,
      })),
      createdAt: toner.createdAt,
      updatedAt: toner.updatedAt,
    };
  }
}
