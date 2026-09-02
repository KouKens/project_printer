import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fromDate, toDate, today } from '../common/date';
import { toText } from '../common/text';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerPriceDto } from './dto/create-toner-price.dto';
import { CreateTonerDto } from './dto/create-toner.dto';
import { UpdateTonerDto } from './dto/update-toner.dto';

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
          alertThreshold: dto.alertThreshold ?? null,
          yieldPages: dto.yieldPages ?? null,
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

  /**
   * マスタの一覧。**既定では無効にした品番を返さない。**
   *
   * 受付の検索・注文・請求書の明細はどれもここから候補を作るので、
   * ここで外しておけば「使っていない品番を選べてしまう」場所が残らない。
   * 無効の分まで要るのはトナー登録の画面だけで、そこだけ true を渡す
   */
  async findAll(includeDisabled = false) {
    const toners = await this.prisma.toner.findMany({
      where: includeDisabled ? {} : { disabledAt: null },
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
          alertThreshold:
            dto.alertThreshold === undefined ? undefined : dto.alertThreshold,
          yieldPages: dto.yieldPages === undefined ? undefined : dto.yieldPages,
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

  /**
   * 使わなくなった品番を無効にする／元に戻す。**削除の代わり。**
   *
   * 消すと、受付の履歴・注文・請求書の明細から相手が居なくなる。
   * 価格の履歴・対応プリンター・在庫の行も道連れで消える（onDelete: Cascade）。
   * 印を付けて一覧と選択肢から外すだけにして、記録はそのまま残す。
   *
   * **止める条件は設けない。** 在庫が残っていても無効にしてよい。
   * いつでも元に戻せるので、間違えても失うものが無い。
   * 残った在庫を廃棄したくなったら、元に戻してから受付で処理する
   * （無効のあいだは受付の検索に出てこないため）
   */
  async setDisabled(id: string, disabled: boolean) {
    const toner = await this.prisma.toner.findUnique({ where: { id } });
    if (!toner) {
      throw new NotFoundException(`${id} は登録されていません`);
    }

    await this.prisma.toner.update({
      where: { id },
      data: { disabledAt: disabled ? new Date() : null },
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

    const registered = new Set(found.map((asset) => asset.id));
    const missing = assetIds.filter((id) => !registered.has(id));
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
    alertThreshold: number | null;
    yieldPages: number | null;
    disabledAt: Date | null;
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
      /** 在庫がこの本数以下なら画面で警告する。未設定は null */
      alertThreshold: toner.alertThreshold,
      /** 1 本で刷れる枚数（カタログ値）。未設定は null */
      yieldPages: toner.yieldPages,
      /** 今日の時点の税別価格。まだ登録が無ければ null */
      price: current?.price ?? null,
      /**
       * 1 枚あたりのトナー代（税別）。価格と印刷可能枚数の両方があるときだけ出す。
       * 円未満を切らずに返し、丸め方は画面に任せる
       */
      costPerPage:
        current && toner.yieldPages ? current.price / toner.yieldPages : null,
      priceFrom: current ? fromDate(current.effectiveFrom) : null,
      /** 改定の回数が分かるように件数だけ添える */
      priceCount: toner.prices.length,
      /** 無効にした日時。null なら有効。画面はこれで一覧を 2 つに分ける */
      disabledAt: toner.disabledAt,
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
