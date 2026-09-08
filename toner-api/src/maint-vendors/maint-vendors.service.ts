import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toText } from '../common/text';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintVendorDto } from './dto/create-maint-vendor.dto';

/**
 * メーカー名を突き合わせるための鍵。**表記ゆれを畳む。**
 *
 * - `NFKC` で全角英数（`ＲＩＣＯＨ`）を半角に、半角カナ（`ｷﾔﾉﾝ`）を全角に揃える
 * - `toLowerCase()` で大文字小文字を畳む（`RICOH` / `Ricoh`）
 *
 * 画面側の入力候補（`lib/suggest.ts` の `foldKey`）と同じ畳み方にしてある。
 * 片方だけ全角を畳むと、画面では 1 件にまとまって見えるのに DB では
 * 別のメーカーとして扱われる、という食い違いが起きる。
 *
 * **判定が緩くなる方向にしか動かない。** 正規化は関数なので、等しい文字列は
 * 正規化後も等しいまま。今ついている業者が外れることはなく、
 * これまで引けなかった組み合わせが引けるようになるだけ
 */
export function makerKey(maker: string): string {
  return maker.trim().normalize('NFKC').toLowerCase();
}

/** 空欄と重複を落とす。並びは入力どおりに残す */
function toMakers(makers: string[] | undefined): string[] {
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const maker of makers ?? []) {
    const text = maker.trim();
    if (text.length === 0 || seen.has(makerKey(text))) continue;
    seen.add(makerKey(text));
    kept.push(text);
  }
  return kept;
}

/** 空文字や空白だけの行は連絡先として持たない。並びは入力どおりに残す */
function toPhones(phones: string[] | undefined): string[] {
  return (phones ?? []).map((phone) => phone.trim()).filter(Boolean);
}

type VendorRow = {
  id: number;
  name: string;
  phones: string[];
  makers: string[];
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  assets?: {
    id: number;
    department: string | null;
    no: string | null;
    maker: string | null;
    model: string | null;
  }[];
};

@Injectable()
export class MaintVendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaintVendorDto) {
    const name = dto.name.trim();
    await this.ensureNameFree(name);
    const makers = toMakers(dto.makers);
    await this.ensureMakersFree(makers);

    const saved = await this.prisma.maintVendor.create({
      data: {
        name,
        phones: toPhones(dto.phones),
        makers,
        note: toText(dto.note),
      },
      include: { assets: true },
    });
    return this.toResponse(saved, await this.makerAssetCounts());
  }

  /** 会社名の順。担当している機器も添えて返す */
  async findAll() {
    const [rows, byMaker] = await Promise.all([
      this.prisma.maintVendor.findMany({
        orderBy: { name: 'asc' },
        include: {
          assets: { orderBy: [{ department: 'asc' }, { no: 'asc' }] },
        },
      }),
      this.makerAssetCounts(),
    ]);
    return rows.map((row) => this.toResponse(row, byMaker));
  }

  async findOne(id: number) {
    const row = await this.prisma.maintVendor.findUnique({
      where: { id },
      include: {
        assets: { orderBy: [{ department: 'asc' }, { no: 'asc' }] },
      },
    });
    if (!row) {
      throw new NotFoundException(`ID ${id} の保守業者は登録されていません`);
    }
    return this.toResponse(row, await this.makerAssetCounts());
  }

  async update(id: number, dto: CreateMaintVendorDto) {
    await this.ensureExists(id);
    const name = dto.name.trim();
    await this.ensureNameFree(name, id);
    const makers = toMakers(dto.makers);
    await this.ensureMakersFree(makers, id);

    const saved = await this.prisma.maintVendor.update({
      where: { id },
      data: {
        name,
        phones: toPhones(dto.phones),
        makers,
        note: toText(dto.note),
      },
      include: { assets: true },
    });
    return this.toResponse(saved, await this.makerAssetCounts());
  }

  /**
   * 消しても台帳は消えない。
   * 参照している台帳の保守業者が未設定に戻るだけ（スキーマの onDelete: SetNull）。
   * ただし何台に影響するかは黙って消さずに件数で返す
   */
  async remove(id: number) {
    const vendor = await this.findOne(id);
    await this.prisma.maintVendor.delete({ where: { id } });
    return { id, clearedAssets: vendor.assets.length };
  }

  // ── 内部ヘルパー ──────────────────────

  /** 業者があることだけ確かめる。更新の前置きなので 1 件を組み立て直さない */
  private async ensureExists(id: number) {
    const found = await this.prisma.maintVendor.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(`ID ${id} の保守業者は登録されていません`);
    }
  }

  /** 台帳の選択欄に同じ名前が 2 つ並ぶと選べないので、会社名は重複させない */
  private async ensureNameFree(name: string, exceptId?: number) {
    if (name.length === 0) {
      throw new BadRequestException('会社名を入力してください');
    }

    const found = await this.prisma.maintVendor.findUnique({
      where: { name },
      select: { id: true },
    });
    if (found && found.id !== exceptId) {
      throw new ConflictException(`${name} はすでに登録されています`);
    }
  }

  /**
   * メーカー名 → 「業者を指定していない機器」の台数。
   * カードに出す「メーカー既定で見ている台数」の元になる
   */
  private async makerAssetCounts(): Promise<Map<string, number>> {
    const assets = await this.prisma.printerAsset.findMany({
      where: { maintVendorId: null },
      select: { maker: true },
    });

    const counts = new Map<string, number>();
    for (const asset of assets) {
      if (!asset.maker) continue;
      const key = makerKey(asset.maker);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }

  /**
   * 同じメーカーを 2 社が名乗ると、台帳に指定の無い機器がどちらに行くか決まらない。
   * 先に登録したほうを残し、後から名乗るほうを弾く
   */
  private async ensureMakersFree(makers: string[], exceptId?: number) {
    if (makers.length === 0) return;

    const others = await this.prisma.maintVendor.findMany({
      where: exceptId === undefined ? {} : { id: { not: exceptId } },
      select: { name: true, makers: true },
    });

    const taken = new Map<string, string>();
    for (const other of others) {
      for (const maker of other.makers) taken.set(makerKey(maker), other.name);
    }

    for (const maker of makers) {
      const owner = taken.get(makerKey(maker));
      if (owner) {
        throw new ConflictException(
          `${maker} の既定はすでに ${owner} になっています。先にそちらから外してください`,
        );
      }
    }
  }

  private toResponse(vendor: VendorRow, makerCounts: Map<string, number>) {
    return {
      id: vendor.id,
      name: vendor.name,
      phones: vendor.phones,
      makers: vendor.makers,
      note: vendor.note,
      /**
       * メーカーの既定として見ている台数。
       * 台帳で業者を指定していない機器のうち、メーカーが一致するもの
       */
      makerAssetCount: vendor.makers.reduce(
        (sum, maker) => sum + (makerCounts.get(makerKey(maker)) ?? 0),
        0,
      ),
      /** この業者を名指しで指定している機器。上書きしている台の一覧 */
      assets: (vendor.assets ?? []).map((asset) => ({
        id: asset.id,
        department: asset.department,
        no: asset.no,
        maker: asset.maker,
        model: asset.model,
      })),
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    };
  }
}
