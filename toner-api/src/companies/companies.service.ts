import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toText } from '../common/text';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

/**
 * 機器とトナーを持っている会社。
 *
 * **在庫と受け払いを分ける単位。** 持ち出し・搬入・棚卸・注文はこの単位で数え、
 * 機器の状態・印刷枚数・修理履歴・請求書は全社まとめて見る。
 *
 * **見せない仕組みではない。** 認証を持たないシステムなので、
 * 画面のセレクタで切り替えれば誰でも他社を見られる。
 * 閲覧を本当に制限するならログインが要る
 */
type CompanyRow = {
  id: number;
  name: string;
  sortOrder: number;
  note: string | null;
  disabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { assets: number; stocks: number; entries: number; orders: number };
};

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const name = dto.name.trim();
    await this.ensureNameFree(name);

    const saved = await this.prisma.company.create({
      data: {
        name,
        sortOrder: dto.sortOrder ?? 0,
        note: toText(dto.note),
      },
      include: { _count: { select: this.counts } },
    });
    return this.toResponse(saved);
  }

  /**
   * 会社の一覧。**既定では無効にした会社を返さない。**
   *
   * セレクタはここから作られるので、使っていない会社を選べないようにする。
   * 無効の分まで要るのは会社登録の画面だけで、そこだけ true を渡す
   */
  async findAll(includeDisabled = false) {
    const companies = await this.prisma.company.findMany({
      where: includeDisabled ? {} : { disabledAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: this.counts } },
    });
    return companies.map((company) => this.toResponse(company));
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { _count: { select: this.counts } },
    });
    if (!company) {
      throw new NotFoundException(`ID ${id} の会社は登録されていません`);
    }
    return this.toResponse(company);
  }

  async update(id: number, dto: CreateCompanyDto) {
    await this.ensureExists(id);
    const name = dto.name.trim();
    await this.ensureNameFree(name, id);

    const saved = await this.prisma.company.update({
      where: { id },
      data: {
        name,
        sortOrder: dto.sortOrder ?? 0,
        note: toText(dto.note),
      },
      include: { _count: { select: this.counts } },
    });
    return this.toResponse(saved);
  }

  /**
   * 使わなくなった会社を無効にする／元に戻す。**削除の代わり。**
   *
   * 機器・在庫・履歴・注文がぶら下がっているので、行ごと消すと過去の記録が壊れる。
   * 無効にするとセレクタから外れるが、記録はそのまま残る。
   *
   * **最後の 1 社は無効にできない。** 会社が 0 になると、
   * どの会社で受け付ければよいか決まらず、入力の画面が使えなくなる
   */
  async setDisabled(id: number, disabled: boolean) {
    await this.ensureExists(id);

    if (disabled) {
      const active = await this.prisma.company.count({
        where: { disabledAt: null, id: { not: id } },
      });
      if (active === 0) {
        throw new BadRequestException(
          '最後の 1 社は無効にできません。受け付ける先が無くなり、持ち出し・搬入・棚卸が使えなくなります',
        );
      }
    }

    const saved = await this.prisma.company.update({
      where: { id },
      data: { disabledAt: disabled ? new Date() : null },
      include: { _count: { select: this.counts } },
    });
    return this.toResponse(saved);
  }

  /**
   * 会社を完全に消す。**登録し間違えた行の後始末用。**
   *
   * 無効にしたものだけ、機器・在庫・履歴・注文が 1 つも無いときだけ。
   * 外部キーは RESTRICT なので DB も拒否するが、
   * 何が残っているかを数えて日本語で返す（制約違反の英語では直しようがないため）
   */
  async remove(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { _count: { select: this.counts } },
    });
    if (!company) {
      throw new NotFoundException(`ID ${id} の会社は登録されていません`);
    }

    if (company.disabledAt === null) {
      throw new BadRequestException(
        `${company.name} はまだ有効です。先に無効にしてから削除してください`,
      );
    }

    const blockers: string[] = [];
    if (company._count.assets > 0) {
      blockers.push(`機器 ${company._count.assets} 台`);
    }
    if (company._count.stocks > 0) {
      blockers.push(`在庫の記録 ${company._count.stocks} 件`);
    }
    if (company._count.entries > 0) {
      blockers.push(`受付の履歴 ${company._count.entries} 件`);
    }
    if (company._count.orders > 0) {
      blockers.push(`注文 ${company._count.orders} 件`);
    }

    if (blockers.length > 0) {
      throw new BadRequestException(
        `${company.name} には${blockers.join('・')}がぶら下がっているため削除できません。` +
          '無効のままにしておけば、セレクタからは外れたまま記録が残ります',
      );
    }

    await this.prisma.company.delete({ where: { id } });
    return { id, deleted: true };
  }

  // ── 内部ヘルパー ──────────────────────

  /** 画面に出す件数。無効にしてよいか・消してよいかの判断に使う */
  private readonly counts = {
    assets: true,
    stocks: true,
    entries: true,
    orders: true,
  } as const;

  private async ensureExists(id: number) {
    const found = await this.prisma.company.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(`ID ${id} の会社は登録されていません`);
    }
  }

  /** 会社名はセレクタの見出しなので重複させない */
  private async ensureNameFree(name: string, exceptId?: number) {
    const found = await this.prisma.company.findFirst({
      where: {
        name,
        ...(exceptId === undefined ? {} : { id: { not: exceptId } }),
      },
      select: { id: true },
    });
    if (found) {
      throw new ConflictException(`${name} はすでに登録されています`);
    }
  }

  private toResponse(company: CompanyRow) {
    return {
      id: company.id,
      name: company.name,
      sortOrder: company.sortOrder,
      note: company.note,
      disabledAt: company.disabledAt,
      /** ぶら下がっている件数。無効・削除の可否を画面で出すために返す */
      counts: {
        assets: company._count?.assets ?? 0,
        stocks: company._count?.stocks ?? 0,
        entries: company._count?.entries ?? 0,
        orders: company._count?.orders ?? 0,
      },
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
