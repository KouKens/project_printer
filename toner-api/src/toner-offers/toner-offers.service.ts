import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fromDate, toDate } from '../common/date';
import type { SupplyPartInput } from '../common/supply-part';
import { toText } from '../common/text';
import { asIs, field, WriteMode } from '../common/write-mode';
import { makerKey } from '../maint-vendors/maint-vendors.service';
import { modelKey } from '../printer-assets/printer-assets.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTonerOfferDto,
  OfferModelDto,
} from './dto/create-toner-offer.dto';

/**
 * 品番を突き合わせる鍵。**画面の `foldKey`・API の `makerKey` と同じ畳み方**
 * （NFKC で全角半角、小文字で大文字小文字）。`ｐ５００ｈ` と `P500H` が同じ品番になる
 */
export const codeKey = (code: string) => makerKey(code);

/**
 * 1 本あたりの価格。入数で割る（2 本セット 14,000 円なら 7,000 円）。
 * 価格が無ければ null
 */
export function unitPriceOf(offer: {
  price: number | null;
  packQuantity: number;
}): number | null {
  return offer.price === null ? null : offer.price / offer.packQuantity;
}

type CostInput = {
  price: number | null;
  packQuantity: number;
  yieldPages: number | null;
  pagePrice: number | null;
  shippingFee: number | null;
  minOrder: number | null;
};

/**
 * 本体の 1 枚あたり（送料・月額を足す前）。
 *
 * **カウンター料金（pagePrice）が入っていればそれを使う。** 枚数で払う買い方では
 * 本の値段が無いか、あっても参考値で、払うのは 1 枚ごとの料金だから。
 * 無ければ 1 本あたりの価格 ÷ 印刷可能枚数。どちらも出せなければ null
 */
export function basePerPageOf(offer: CostInput): number | null {
  if (offer.pagePrice !== null) return offer.pagePrice;
  const unit = unitPriceOf(offer);
  return unit !== null && offer.yieldPages ? unit / offer.yieldPages : null;
}

/**
 * 1 回の注文で頼む本数。送料を割る数。
 * **最小注文数があればそれだけ頼むとみなし、無ければ 1 箱ぶん（入数）。**
 * 最小注文数が入数より少なくても、箱は割って買えないので入数を下回らない
 */
export function orderUnitsOf(offer: CostInput): number {
  return Math.max(offer.minOrder ?? offer.packQuantity, offer.packQuantity);
}

/**
 * 送料の 1 枚あたり。送料 ÷（1 回に頼む本数 × 印刷可能枚数）。
 *
 * 送料が無い（未入力・0 円）なら 0。**送料はあるのに印刷可能枚数が無いと割れないので null**
 * （カウンター料金だけ入れた契約など）。その場合 1 枚あたりには足さず、画面が断りを出す
 */
export function shippingPerPageOf(offer: CostInput): number | null {
  if (!offer.shippingFee) return 0;
  if (!offer.yieldPages) return null;
  return offer.shippingFee / (orderUnitsOf(offer) * offer.yieldPages);
}

/**
 * 1 枚あたり（本体 ＋ 送料）。**月額の基本料金はここでは足さない** ——
 * 月額を 1 枚あたりにするには、その台が月に何枚刷るかが要る。
 * トナー価格比較でプリンターを選んだとき、その台の枚数で割って画面が足す
 */
export function costPerPageOf(offer: CostInput): number | null {
  const base = basePerPageOf(offer);
  return base === null ? null : base + (shippingPerPageOf(offer) ?? 0);
}

/**
 * 送られた機種を保存する形に。空の型番を落とし、**畳んで同じ機種になるものは 1 つにする**
 * （`RICOH P 500` と `ricoh P500` を両方付けても、比較では同じ機種なので）
 */
export function toModels(
  models: OfferModelDto[] | undefined,
): { maker: string | null; model: string }[] {
  const seen = new Set<string>();
  const kept: { maker: string | null; model: string }[] = [];
  for (const item of models ?? []) {
    const model = item.model.trim();
    if (model === '') continue;
    const maker = toText(item.maker);
    const key = modelKey(maker, model);
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push({ maker, model });
  }
  return kept;
}

type OfferRow = {
  id: number;
  code: string;
  name: string | null;
  brand: string | null;
  kind: 'GENUINE' | 'RECYCLED' | 'COMPATIBLE';
  part: SupplyPartInput;
  color: string | null;
  yieldPages: number | null;
  packQuantity: number;
  seller: string;
  purchaseType: 'SPOT' | 'ONLINE' | 'CONTRACT' | 'SUBSCRIPTION' | 'OTHER';
  price: number | null;
  pagePrice: number | null;
  monthlyFee: number | null;
  shippingFee: number | null;
  minOrder: number | null;
  leadTime: string | null;
  warranty: string | null;
  takesBack: boolean | null;
  payment: string | null;
  quotedOn: Date | null;
  validUntil: Date | null;
  reference: string | null;
  url: string | null;
  contact: string | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  models: { maker: string | null; model: string }[];
};

/** 有効な台帳の機種。登録の画面がチェックを並べ、比較の画面が台と結ぶ */
export type LedgerModel = {
  key: string;
  /** その機種でいちばん多い表記。保存するときはこの 2 つを送る */
  maker: string | null;
  model: string;
  label: string;
  assetCount: number;
};

/** 応答を組み立てるのに要る、台帳とトナー登録の見取り図 */
type Context = {
  models: Map<string, LedgerModel>;
  /** トナー登録の今使っている品番（畳んだ鍵 → 品番）。無効・他の画面に出さないものは入れない */
  masterCodes: Map<string, string>;
};

@Injectable()
export class TonerOffersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 一覧。**品番 → 販売店の順。** 同じ品番を売っている店が並ぶようにする。
   *
   * 登録の画面が要るものをまとめて返す: 有効な台帳の機種（チェックの選択肢）と、
   * トナー登録にある色（入力候補。比較の画面で同じ色どうしを並べるには表記を揃えたい）
   */
  async findAll() {
    const [rows, context, colors] = await Promise.all([
      this.prisma.tonerOffer.findMany({
        orderBy: [{ code: 'asc' }, { seller: 'asc' }, { id: 'asc' }],
        include: { models: { orderBy: { id: 'asc' } } },
      }),
      this.context(),
      this.prisma.toner.findMany({
        where: { color: { not: null } },
        select: { color: true },
      }),
    ]);

    return {
      offers: rows.map((row) => this.toResponse(row, context)),
      models: [...context.models.values()].sort((a, b) =>
        a.label.localeCompare(b.label, 'ja', { numeric: true }),
      ),
      /** トナー登録の色（重なりあり。画面の suggestions が多い順に畳む） */
      tonerColors: colors
        .map((row) => row.color)
        .filter((color): color is string => color !== null),
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.tonerOffer.findUnique({
      where: { id },
      include: { models: { orderBy: { id: 'asc' } } },
    });
    if (!row) {
      throw new NotFoundException(`ID ${id} のトナー情報は登録されていません`);
    }
    return this.toResponse(row, await this.context());
  }

  async create(dto: CreateTonerOfferDto) {
    this.ensureDates(dto);
    const saved = await this.prisma.tonerOffer.create({
      data: {
        ...this.toData(dto, 'create'),
        models: { create: toModels(dto.models) },
      },
      select: { id: true },
    });
    return this.findOne(saved.id);
  }

  /**
   * 更新。**送られてこなかった項目に触らない**（`field()`）。
   * 機種は配列が来たときだけ入れ替える
   */
  async update(id: number, dto: CreateTonerOfferDto) {
    await this.ensureExists(id);
    this.ensureDates(dto);

    await this.prisma.$transaction(async (tx) => {
      await tx.tonerOffer.update({
        where: { id },
        data: this.toData(dto, 'update'),
      });
      if (dto.models !== undefined) {
        await tx.tonerOfferModel.deleteMany({ where: { offerId: id } });
        const models = toModels(dto.models);
        if (models.length > 0) {
          await tx.tonerOfferModel.createMany({
            data: models.map((item) => ({ ...item, offerId: id })),
          });
        }
      }
    });
    return this.findOne(id);
  }

  /**
   * 消す。**他から参照されていないので、そのまま消してよい**
   * （受付・注文・請求書はトナー登録しか指さない）。使える機種は道連れ（Cascade）
   */
  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.tonerOffer.delete({ where: { id } });
    return { id, deleted: true };
  }

  // ── 内部ヘルパー ──────────────────────

  private async ensureExists(id: number) {
    const found = await this.prisma.tonerOffer.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(`ID ${id} のトナー情報は登録されていません`);
    }
  }

  /** 有効期限が確かめた日より前なら打ち間違い。両方あるときだけ見る */
  private ensureDates(dto: CreateTonerOfferDto) {
    if (dto.quotedOn && dto.validUntil && dto.validUntil < dto.quotedOn) {
      throw new BadRequestException(
        '見積の有効期限が価格を確かめた日より前になっています。日付を確認してください',
      );
    }
  }

  /**
   * 有効な台帳の機種と、トナー登録の品番。
   *
   * 機種の畳み方は `modelKey`（トナー個数状況・価格比較と同じ）。
   * **型番が空の台は機種として出さない** —— メーカーだけで畳むと、
   * 型番未入力の台がまとめて 1 つの機種に見えるため（`inheritToners` と同じ扱い）
   */
  private async context(): Promise<Context> {
    const [assets, toners] = await Promise.all([
      this.prisma.printerAsset.findMany({
        where: { disabledAt: null },
        select: { maker: true, model: true },
      }),
      // 「使用中の品番」と出すので、今使っている品番だけ（無効・他の画面に出さないものは除く）
      this.prisma.toner.findMany({
        where: { disabledAt: null, hidden: false },
        select: { id: true },
      }),
    ]);

    type Spelling = { maker: string | null; model: string; count: number };
    const spellings = new Map<string, Map<string, Spelling>>();
    for (const asset of assets) {
      const model = asset.model?.trim();
      if (!model) continue;
      const maker = asset.maker?.trim() || null;
      const key = modelKey(maker, model);
      const seen = spellings.get(key) ?? new Map<string, Spelling>();
      const label = [maker, model].filter(Boolean).join(' ');
      const cur = seen.get(label) ?? { maker, model, count: 0 };
      cur.count += 1;
      seen.set(label, cur);
      spellings.set(key, seen);
    }

    const models = new Map<string, LedgerModel>();
    for (const [key, seen] of spellings) {
      // 呼び名はその機種でいちばん多い書き方（findByModel と同じ）
      const [label, best] = [...seen.entries()].sort(
        (a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0], 'ja'),
      )[0];
      models.set(key, {
        key,
        maker: best.maker,
        model: best.model,
        label,
        assetCount: [...seen.values()].reduce((sum, s) => sum + s.count, 0),
      });
    }

    return {
      models,
      masterCodes: new Map(
        toners.map((toner) => [codeKey(toner.id), toner.id]),
      ),
    };
  }

  private toData(dto: CreateTonerOfferDto, mode: WriteMode) {
    return {
      // 品番と販売店は必須（DTO が空を弾く）。前後の空白だけ落とす
      code: dto.code.trim(),
      seller: dto.seller.trim(),
      name: field(mode, dto.name, toText, null),
      brand: field(mode, dto.brand, toText, null),
      kind: field(mode, dto.kind, asIs, 'GENUINE' as const),
      part: field(mode, dto.part, asIs, 'TONER' as const),
      color: field(mode, dto.color, toText, null),
      yieldPages: field(mode, dto.yieldPages, asIs, null),
      packQuantity: field(mode, dto.packQuantity, asIs, 1),
      purchaseType: field(mode, dto.purchaseType, asIs, 'SPOT' as const),
      price: field(mode, dto.price, asIs, null),
      pagePrice: field(mode, dto.pagePrice, asIs, null),
      monthlyFee: field(mode, dto.monthlyFee, asIs, null),
      shippingFee: field(mode, dto.shippingFee, asIs, null),
      minOrder: field(mode, dto.minOrder, asIs, null),
      leadTime: field(mode, dto.leadTime, toText, null),
      warranty: field(mode, dto.warranty, toText, null),
      takesBack: field(mode, dto.takesBack, asIs, null),
      payment: field(mode, dto.payment, toText, null),
      quotedOn: field(mode, dto.quotedOn, toDate, null),
      validUntil: field(mode, dto.validUntil, toDate, null),
      reference: field(mode, dto.reference, toText, null),
      url: field(mode, dto.url, toText, null),
      contact: field(mode, dto.contact, toText, null),
      note: field(mode, dto.note, toText, null),
    };
  }

  private toResponse(row: OfferRow, context: Context) {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      brand: row.brand,
      kind: row.kind,
      part: row.part,
      color: row.color,
      yieldPages: row.yieldPages,
      packQuantity: row.packQuantity,
      seller: row.seller,
      purchaseType: row.purchaseType,
      price: row.price,
      pagePrice: row.pagePrice,
      monthlyFee: row.monthlyFee,
      shippingFee: row.shippingFee,
      minOrder: row.minOrder,
      leadTime: row.leadTime,
      warranty: row.warranty,
      takesBack: row.takesBack,
      payment: row.payment,
      quotedOn: fromDate(row.quotedOn),
      validUntil: fromDate(row.validUntil),
      reference: row.reference,
      url: row.url,
      contact: row.contact,
      note: row.note,
      /** 1 本あたりの価格（価格 ÷ 入数） */
      unitPrice: unitPriceOf(row),
      /** 本体の 1 枚あたり。カウンター料金があればそれ、無ければ 1 本あたり ÷ 印刷可能枚数 */
      basePerPage: basePerPageOf(row),
      /** 送料を割るときの 1 回の注文の本数（最小注文数、無ければ入数） */
      orderUnits: orderUnitsOf(row),
      /** 送料の 1 枚あたり。送料が無ければ 0、印刷可能枚数が無くて割れなければ null */
      shippingPerPage: shippingPerPageOf(row),
      /** 1 枚あたり（本体 ＋ 送料）。月額は台の枚数が要るので、比較の画面が足す */
      costPerPage: costPerPageOf(row),
      /**
       * 使える機種。`assetCount` が 0 なら、その表記の機種が有効な台帳に無い
       * （入れ替えて無効にした・表記が違う）。画面は「台帳に無し」と添える
       */
      models: row.models.map((item) => {
        const key = modelKey(item.maker, item.model);
        return {
          maker: item.maker,
          model: item.model,
          key,
          label: [item.maker, item.model].filter(Boolean).join(' '),
          assetCount: context.models.get(key)?.assetCount ?? 0,
        };
      }),
      /** トナー登録に同じ品番があればその品番（畳んで比べる）。今使っている品を別の店で買う値段 */
      masterId: context.masterCodes.get(codeKey(row.code)) ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
