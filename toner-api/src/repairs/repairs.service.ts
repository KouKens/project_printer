import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fromDate, toDate } from '../common/date';
import { toText } from '../common/text';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRepairDto,
  RepairCategoryInput,
  RepairHandlerInput,
  RepairStatusInput,
} from './dto/create-repair.dto';

type RepairRow = {
  id: number;
  assignee: string | null;
  printerAssetId: number;
  occurredOn: Date | null;
  category: RepairCategoryInput | null;
  handledBy: RepairHandlerInput;
  detail: string | null;
  cost: number | null;
  restoredOn: Date | null;
  status: RepairStatusInput;
  createdAt: Date;
  updatedAt: Date;
  asset?: {
    /** 持っている会社。修理は全社まとめて見るので、列として出す */
    company: { id: number; name: string } | null;
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
      include: { asset: { include: { company: true } } },
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
      include: { asset: { include: { company: true } } },
    });
    return rows.map((row) => this.toResponse(row));
  }

  async findOne(id: number) {
    const row = await this.prisma.repairRecord.findUnique({
      where: { id },
      include: { asset: { include: { company: true } } },
    });
    if (!row) {
      throw new NotFoundException(`ID ${id} の修理履歴は登録されていません`);
    }
    return this.toResponse(row);
  }

  async update(id: number, dto: CreateRepairDto) {
    await this.ensureExists(id);
    await this.ensureAsset(dto.printerAssetId);
    this.ensureDateOrder(dto);

    const saved = await this.prisma.repairRecord.update({
      where: { id },
      data: this.toData(dto),
      include: { asset: { include: { company: true } } },
    });
    return this.toResponse(saved);
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.repairRecord.delete({ where: { id } });
    return { id };
  }

  // ── 内部ヘルパー ──────────────────────

  /** 履歴があることだけ確かめる。更新・削除の前置きなので 1 件を組み立て直さない */
  private async ensureExists(id: number) {
    const found = await this.prisma.repairRecord.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(`ID ${id} の修理履歴は登録されていません`);
    }
  }

  private async ensureAsset(printerAssetId: number) {
    const asset = await this.prisma.printerAsset.findUnique({
      where: { id: printerAssetId },
      select: { id: true },
    });
    if (!asset) {
      throw new BadRequestException(
        `ID ${printerAssetId} の機器は端末台帳にありません`,
      );
    }
  }

  /**
   * 復旧が発生より前になっていたら弾く。入力の誤りをそのまま残さない。
   * どちらも任意なので、両方入っているときだけ見る
   */
  private ensureDateOrder(dto: CreateRepairDto) {
    if (dto.occurredOn && dto.restoredOn && dto.restoredOn < dto.occurredOn) {
      throw new BadRequestException(
        '復旧日が発生日より前になっています。日付を確認してください',
      );
    }
  }

  private toData(dto: CreateRepairDto) {
    return {
      // 空白だけの入力は未入力と同じ扱いにする
      assignee: toText(dto.assignee),
      printerAssetId: dto.printerAssetId,
      occurredOn: toDate(dto.occurredOn),
      category: dto.category ?? null,
      handledBy: dto.handledBy,
      detail: toText(dto.detail),
      cost: dto.cost ?? null,
      restoredOn: toDate(dto.restoredOn),
      status: dto.status ?? 'INVESTIGATING',
    };
  }

  private toResponse(row: RepairRow) {
    return {
      id: row.id,
      assignee: row.assignee,
      printerAssetId: row.printerAssetId,
      // 一覧でそのまま出せるよう、台帳側の呼び名も添える
      companyId: row.asset?.company?.id ?? null,
      company: row.asset?.company?.name ?? null,
      department: row.asset?.department ?? null,
      no: row.asset?.no ?? null,
      maker: row.asset?.maker ?? null,
      model: row.asset?.model ?? null,
      occurredOn: fromDate(row.occurredOn),
      category: row.category,
      handledBy: row.handledBy,
      detail: row.detail,
      cost: row.cost,
      restoredOn: fromDate(row.restoredOn),
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
