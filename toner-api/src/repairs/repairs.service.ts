import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRepairDto,
  RepairCategoryInput,
  RepairHandlerInput,
  RepairStatusInput,
} from './dto/create-repair.dto';

/**
 * @db.Date の列にローカル 0 時の Date を渡すと JST では前日にずれる。
 * UTC 成分しか見られないので、UTC の 0 時で作る。
 */
function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** 空文字・空白だけの入力は未入力と同じ扱いにして null に寄せる */
function trimmed(value: string | null | undefined): string | null {
  const text = value?.trim() ?? '';
  return text === '' ? null : text;
}

/** 読むときも UTC 成分で取り出す。画面の <input type="date"> にそのまま入る形 */
function fromDate(value: Date | null): string | null {
  if (!value) return null;
  const month = `${value.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${value.getUTCDate()}`.padStart(2, '0');
  return `${value.getUTCFullYear()}-${month}-${day}`;
}

type RepairRow = {
  id: number;
  assignee: string | null;
  printerAssetId: number;
  occurredOn: Date | null;
  category: RepairCategoryInput | null;
  handledBy: RepairHandlerInput;
  detail: string | null;
  restoredOn: Date;
  status: RepairStatusInput;
  createdAt: Date;
  updatedAt: Date;
  asset?: {
    department: string | null;
    no: string | null;
    maker: string | null;
    model: string | null;
  } | null;
};

@Injectable()
export class RepairsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRepairDto) {
    await this.ensureAsset(dto.printerAssetId);
    this.ensureDateOrder(dto);

    const saved = await this.prisma.repairRecord.create({
      data: this.toData(dto),
      include: { asset: true },
    });
    return this.toResponse(saved);
  }

  /**
   * 発生日の新しい順。同じ日は後から入れたものを上に出す。
   * 発生日は任意なので、未入力の行は末尾に置く（既定では NULL が先頭に来る）
   */
  async findAll() {
    const rows = await this.prisma.repairRecord.findMany({
      orderBy: [
        { occurredOn: { sort: 'desc', nulls: 'last' } },
        { id: 'desc' },
      ],
      include: { asset: true },
    });
    return rows.map((row) => this.toResponse(row));
  }

  async findOne(id: number) {
    const row = await this.prisma.repairRecord.findUnique({
      where: { id },
      include: { asset: true },
    });
    if (!row) {
      throw new NotFoundException(`ID ${id} の修理履歴は登録されていません`);
    }
    return this.toResponse(row);
  }

  async update(id: number, dto: CreateRepairDto) {
    await this.findOne(id);
    await this.ensureAsset(dto.printerAssetId);
    this.ensureDateOrder(dto);

    const saved = await this.prisma.repairRecord.update({
      where: { id },
      data: this.toData(dto),
      include: { asset: true },
    });
    return this.toResponse(saved);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.repairRecord.delete({ where: { id } });
    return { id };
  }

  // ── 内部ヘルパー ──────────────────────

  private async ensureAsset(printerAssetId: number) {
    const asset = await this.prisma.printerAsset.findUnique({
      where: { id: printerAssetId },
    });
    if (!asset) {
      throw new BadRequestException(
        `ID ${printerAssetId} の機器は端末台帳にありません`,
      );
    }
  }

  /**
   * 復旧が発生より前になっていたら弾く。入力の誤りをそのまま残さない。
   * 発生日は任意なので、入っているときだけ見る
   */
  private ensureDateOrder(dto: CreateRepairDto) {
    if (dto.occurredOn && dto.restoredOn < dto.occurredOn) {
      throw new BadRequestException(
        '復旧日が発生日より前になっています。日付を確認してください',
      );
    }
  }

  private toData(dto: CreateRepairDto) {
    return {
      // 空白だけの入力は未入力と同じ扱いにする
      assignee: trimmed(dto.assignee),
      printerAssetId: dto.printerAssetId,
      occurredOn: toDate(dto.occurredOn),
      category: dto.category ?? null,
      handledBy: dto.handledBy,
      detail: trimmed(dto.detail),
      restoredOn: toDate(dto.restoredOn) as Date,
      status: dto.status ?? 'INVESTIGATING',
    };
  }

  private toResponse(row: RepairRow) {
    return {
      id: row.id,
      assignee: row.assignee,
      printerAssetId: row.printerAssetId,
      // 一覧でそのまま出せるよう、台帳側の呼び名も添える
      department: row.asset?.department ?? null,
      no: row.asset?.no ?? null,
      maker: row.asset?.maker ?? null,
      model: row.asset?.model ?? null,
      occurredOn: fromDate(row.occurredOn),
      category: row.category,
      handledBy: row.handledBy,
      detail: row.detail,
      restoredOn: fromDate(row.restoredOn),
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
