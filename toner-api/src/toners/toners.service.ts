import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fromDate, toDate, today } from '../common/date';
import type { SupplyPartInput } from '../common/supply-part';
import { toText } from '../common/text';
import { modelKey } from '../printer-assets/printer-assets.service';
import { indexPrinters, matchPrinter } from '../printers/printer-match';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerPriceDto } from './dto/create-toner-price.dto';
import { CreateTonerDto } from './dto/create-toner.dto';
import { UpdateTonerDto } from './dto/update-toner.dto';

type PriceRow = { price: number; effectiveFrom: Date; note: string | null };

/**
 * 月の印刷枚数を出すのに見る日数（直近）。
 * 月によって刷る量が上下するので 1 か月ぶんより長く取り、季節の変わり目に追いつく程度に短くする
 */
export const VOLUME_DAYS = 90;
/** 記録がこの日数より少ない台は、月の枚数を出さない（数日の偏りで月額の割り方が大きく狂うため） */
const VOLUME_MIN_DAYS = 7;
/** 1 か月の日数。年 365 日を 12 で割る */
const DAYS_PER_MONTH = 365 / 12;
const DAY_MS = 86_400_000;

/**
 * 台ごとの月の印刷枚数（直近 `VOLUME_DAYS` 日の、記録のある日の平均 × 1 か月）。
 *
 * **記録の無い日（電源が切れていた・取れなかった）は数えない。** 暦の日数で割ると、
 * 取れなかった日を「0 枚刷った」と読んで月の枚数が小さくなり、月額の 1 枚あたりが大きく出る。
 * 累計が戻って枚数が null の日も同じ理由で外す
 */
export function monthlyPagesOf(
  rows: { pages: number | null }[],
): number | null {
  const counted = rows.filter(
    (row): row is { pages: number } => row.pages !== null,
  );
  if (counted.length < VOLUME_MIN_DAYS) return null;
  const total = counted.reduce((sum, row) => sum + row.pages, 0);
  return (total / counted.length) * DAYS_PER_MONTH;
}

/** 一覧と 1 件の読み出しで添えるもの。toResponse がこの形を受ける */
const TONER_INCLUDE = {
  stocks: true,
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
  // この品番を純正として指しているリサイクル品。トナー登録の一覧で組を見せる
  alternatives: { select: { id: true }, orderBy: { id: 'asc' } },
} as const;

/**
 * 拠点ごとに分かれている在庫を足す。
 *
 * **品番マスタ（Toner）は全拠点共通**なので、1 品番に拠点の数だけ在庫の行が付く。
 * トナー登録は拠点で分けない画面なので、ここでは全拠点の合計を出す。
 * 拠点ごとの数が要る画面（トナー個数状況・受付）は、拠点で絞った行を直接見る
 */
function sumStock(stocks: { quantity: number }[]): number {
  return stocks.reduce((total, stock) => total + stock.quantity, 0);
}

@Injectable()
export class TonersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * マスタを登録する。**品番マスタは全拠点共通。**
   *
   * 在庫の行はここでは作らない。在庫は「品番 × 拠点」で持つので、
   * どの拠点の分かは搬入して初めて決まる（受付側で upsert する）。
   * 行が無い組み合わせは在庫 0 と同じ意味
   */
  async create(dto: CreateTonerDto) {
    const id = dto.id.trim();

    const exists = await this.prisma.toner.findUnique({ where: { id } });
    if (exists) {
      throw new ConflictException(`${id} はすでに登録されています`);
    }

    await this.assertAssetsExist(dto.printerAssetIds ?? []);

    const recycled = dto.recycled ?? false;
    const genuineId = await this.resolveGenuine(
      id,
      recycled,
      dto.genuineId ?? null,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.toner.create({
        data: {
          id,
          name: toText(dto.name),
          color: toText(dto.color),
          part: dto.part ?? 'TONER',
          recycled,
          genuineId,
          hidden: dto.hidden ?? false,
          alertThreshold: dto.alertThreshold ?? null,
          yieldPages: dto.yieldPages ?? null,
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
   * マスタの一覧。**既定では無効にした品番と、他の画面に出さない品番を返さない。**
   *
   * 受付の検索・注文・請求書の明細はどれもここから候補を作るので、
   * ここで外しておけば「使っていない品番を選べてしまう」場所が残らない。
   * 全部まで要るのはトナー登録の画面だけで、そこだけ true を渡す
   * （価格比較は findPriceCompare で別に引く）
   */
  async findAll(includeDisabled = false) {
    const toners = await this.prisma.toner.findMany({
      where: includeDisabled ? {} : { disabledAt: null, hidden: false },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      include: TONER_INCLUDE,
    });

    return toners.map((toner) => this.toResponse(toner));
  }

  async findOne(id: string) {
    const toner = await this.prisma.toner.findUnique({
      where: { id },
      include: TONER_INCLUDE,
    });

    if (!toner) {
      throw new NotFoundException(`${id} は登録されていません`);
    }
    return this.toResponse(toner);
  }

  /**
   * 他の画面に出さない品番。**無効にしたものも含める。**
   *
   * トナー入出状況は受け払いの記録を並べる画面で、品番マスタを引かずに
   * 行を作っている。どの行を隠すかを決めるために品番だけを渡す
   */
  async findHiddenIds(): Promise<string[]> {
    const rows = await this.prisma.toner.findMany({
      where: { hidden: true },
      select: { id: true },
      orderBy: { id: 'asc' },
    });
    return rows.map((row) => row.id);
  }

  /**
   * 価格比較の画面用。**全品番**（無効・他の画面に出さないものも含む）を、
   * 価格の履歴（古い順）と、使える機種を添えて返す。
   *
   * 機種は対応プリンターの台帳から引き、**有効な台だけ**を見る
   * （入れ替えて無効にした台の機種まで「使える」に数えないため）。
   * 機種のまとめ方はトナー個数状況と同じ `modelKey`。
   *
   * 純正とリサイクル品の組（genuineId）をまとめるのは画面の仕事にする。
   * 対応プリンターを付けていない品番でも、組の相手が付けていれば
   * その機種で引けるよう、画面が組の中で機種を足し合わせる
   */
  async findPriceCompare() {
    const since = new Date(today().getTime() - VOLUME_DAYS * DAY_MS);
    const [toners, assets, printers, dailies] = await Promise.all([
      this.prisma.toner.findMany({
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        include: {
          prices: { orderBy: { effectiveFrom: 'asc' } },
          printers: {
            where: { asset: { disabledAt: null } },
            select: { printerAssetId: true },
          },
        },
      }),
      this.prisma.printerAsset.findMany({
        where: { disabledAt: null },
        orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          no: true,
          department: true,
          maker: true,
          model: true,
          // 実機と突き合わせて、月の印刷枚数を引く（月額の基本料金を 1 枚あたりに割るため）
          ipAddress: true,
          serialNumber: true,
          company: { select: { name: true } },
        },
      }),
      this.prisma.printer.findMany({
        select: { id: true, ipAddress: true, serialNumber: true },
      }),
      this.prisma.pageCountDaily.findMany({
        where: { date: { gte: since } },
        select: { printerId: true, pages: true },
      }),
    ]);

    // 実機ごとの日々の枚数。台帳 → 実機の突き合わせは他の一覧と同じ printer-match
    const pagesByPrinter = new Map<number, { pages: number | null }[]>();
    for (const row of dailies) {
      const list = pagesByPrinter.get(row.printerId) ?? [];
      list.push(row);
      pagesByPrinter.set(row.printerId, list);
    }
    const live = indexPrinters(printers, assets);

    // 機種の呼び名は、その機種でいちばん多く使われている書き方にする（findByModel と同じ）
    const spellings = new Map<string, Map<string, number>>();
    const assetCounts = new Map<string, number>();
    for (const asset of assets) {
      const key = modelKey(asset.maker, asset.model);
      const spelling = [asset.maker, asset.model].filter(Boolean).join(' ');
      const seen = spellings.get(key) ?? new Map<string, number>();
      seen.set(spelling, (seen.get(spelling) ?? 0) + 1);
      spellings.set(key, seen);
      assetCounts.set(key, (assetCounts.get(key) ?? 0) + 1);
    }

    const models = [...spellings.entries()]
      .map(([key, seen]) => {
        const label =
          [...seen.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
        return {
          key,
          /** メーカーも型番も未入力の台帳は空文字。画面は「型番未入力」と出す */
          label,
          assetCount: assetCounts.get(key) ?? 0,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'ja', { numeric: true }));

    const assetById = new Map(assets.map((asset) => [asset.id, asset]));
    const now = today();

    return {
      models,
      /** 月の印刷枚数を出すのに見た日数。画面の断り書きに出す */
      volumeDays: VOLUME_DAYS,
      /**
       * 有効な台帳の全台。画面の「プリンターを選ぶ」の選択肢で、
       * 選んだ台が今使っているトナーは toners[].printers から引く。
       * トナーを紐づけていない台も選べるよう、紐づけとは別に全台を返す
       */
      assets: assets.map((asset) => {
        const printer = matchPrinter(asset, live);
        return {
          id: asset.id,
          no: asset.no,
          department: asset.department,
          maker: asset.maker,
          model: asset.model,
          companyName: asset.company?.name ?? null,
          modelKey: modelKey(asset.maker, asset.model),
          /**
           * 月の印刷枚数（直近の記録のある日の平均 × 1 か月）。
           * 実機と結び付かない・記録が少ない台は null。月額の基本料金を 1 枚あたりに割る数
           */
          monthlyPages:
            printer === null
              ? null
              : monthlyPagesOf(pagesByPrinter.get(printer.id) ?? []),
        };
      }),
      toners: toners.map((toner) => {
        // 古い順に並んでいるので、今日以前の最後の行が今の価格
        const current =
          toner.prices.filter((row) => row.effectiveFrom <= now).at(-1) ?? null;
        const linked = toner.printers
          .map((link) => assetById.get(link.printerAssetId))
          .filter((asset) => asset !== undefined);

        return {
          id: toner.id,
          name: toner.name,
          color: toner.color,
          /** 種類。比較の画面はこれと色でまとめる */
          part: toner.part,
          recycled: toner.recycled,
          genuineId: toner.genuineId,
          hidden: toner.hidden,
          disabledAt: toner.disabledAt,
          yieldPages: toner.yieldPages,
          price: current?.price ?? null,
          priceFrom: current ? fromDate(current.effectiveFrom) : null,
          costPerPage:
            current && toner.yieldPages
              ? current.price / toner.yieldPages
              : null,
          /** 価格の履歴。**古い順**（グラフが左から描くため） */
          prices: toner.prices.map((row) => ({
            effectiveFrom: fromDate(row.effectiveFrom),
            price: row.price,
            note: row.note,
          })),
          /** 対応プリンターのうち有効な台。探す欄で部署や No. から引くのに使う */
          printers: linked.map((asset) => ({
            id: asset.id,
            no: asset.no,
            department: asset.department,
            maker: asset.maker,
            model: asset.model,
            companyName: asset.company?.name ?? null,
          })),
          /** 使える機種の鍵（models の key）。重なりは落とす */
          modelKeys: [
            ...new Set(
              linked.map((asset) => modelKey(asset.maker, asset.model)),
            ),
          ],
        };
      }),
    };
  }

  /**
   * 名前・色・リサイクル区分・純正品・他の画面に出すかと、対応機器を更新する。
   * 価格は addPrice で足す
   */
  async update(id: string, dto: UpdateTonerDto) {
    const toner = await this.prisma.toner.findUnique({
      where: { id },
      include: { _count: { select: { alternatives: true } } },
    });
    if (!toner) {
      throw new NotFoundException(`${id} は登録されていません`);
    }

    if (dto.printerAssetIds !== undefined) {
      await this.assertAssetsExist(dto.printerAssetIds);
    }

    const recycled = dto.recycled ?? toner.recycled;

    // 純正として指されている品番をリサイクル品にすると、組の軸が消える
    if (recycled && toner._count.alternatives > 0) {
      throw new BadRequestException(
        `${id} はリサイクル品 ${toner._count.alternatives} 件から純正品として選ばれているため、` +
          'リサイクル品・互換品にはできません。先にそちらの「純正品」を外してください',
      );
    }

    /*
     * 純正品の指定。送られてこなければ今の値のまま。
     * ただし純正に変えたときは外す（純正は何も指さないので、残すと組が食い違う）
     */
    const genuineId =
      dto.genuineId !== undefined
        ? await this.resolveGenuine(id, recycled, dto.genuineId)
        : !recycled && toner.genuineId !== null
          ? null
          : undefined;

    await this.prisma.$transaction(async (tx) => {
      await tx.toner.update({
        where: { id },
        data: {
          name: dto.name === undefined ? undefined : toText(dto.name),
          color: dto.color === undefined ? undefined : toText(dto.color),
          part: dto.part,
          recycled: dto.recycled,
          genuineId,
          hidden: dto.hidden,
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

  /**
   * 品番を完全に消す。**無効にしたものだけ、参照が 1 つも無いときだけ。**
   *
   * 無効（`disabledAt`）が普段の止め方で、こちらは登録し間違えた品番の後始末。
   * 受付の履歴・注文・請求書の明細は品番を指しており、消すと相手が居なくなる。
   * DB 側も外部キーで拒否するが、**その手前で何が残っているかを数えて文面にする**
   * （制約違反の英語がそのまま画面に出ても、何を直せばよいか分からないため）。
   *
   * 在庫が残っているものも止める。数えた本数が消えるのは記録の欠けと同じで、
   * 廃棄したいなら受付で処理してからにする。
   *
   * 価格の履歴と機器の紐づけは道連れで消えてよい（Cascade）。
   * どちらも品番そのものの付随情報で、品番が無くなれば意味を持たない
   */
  async remove(id: string) {
    const toner = await this.prisma.toner.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entries: true,
            orders: true,
            invoiceLines: true,
            printers: true,
            prices: true,
            alternatives: true,
          },
        },
        stocks: true,
      },
    });

    if (!toner) {
      throw new NotFoundException(`${id} は登録されていません`);
    }

    // 先に無効にしてもらう。一覧から消えた状態を見てから消す 2 段構えにする
    if (toner.disabledAt === null) {
      throw new BadRequestException(
        `${id} はまだ有効です。先に無効にしてから削除してください`,
      );
    }

    const blockers: string[] = [];
    if (toner._count.entries > 0) {
      blockers.push(`受付の履歴 ${toner._count.entries} 件`);
    }
    if (toner._count.orders > 0) {
      blockers.push(`注文 ${toner._count.orders} 件`);
    }
    if (toner._count.invoiceLines > 0) {
      blockers.push(`請求書の明細 ${toner._count.invoiceLines} 件`);
    }

    // 在庫は拠点ごとに行が分かれている。どこかに残っていれば消せない
    const quantity = sumStock(toner.stocks);
    if (quantity > 0) {
      blockers.push(`在庫 ${quantity} 本`);
    }

    if (blockers.length > 0) {
      throw new BadRequestException(
        `${id} は${blockers.join('・')}から参照されているため削除できません。` +
          '無効のままにしておけば、一覧と選択肢からは外れたまま記録が残ります',
      );
    }

    await this.prisma.toner.delete({ where: { id } });

    return {
      id,
      deleted: true,
      /** 道連れで消えたもの。何が無くなったかを画面で知らせる */
      removed: {
        prices: toner._count.prices,
        printers: toner._count.printers,
        /** この品番を純正に選んでいたリサイクル品の数。そちらは組から外れる（SetNull） */
        alternatives: toner._count.alternatives,
      },
    };
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

  /**
   * 純正品の指定を確かめて、保存する値を返す。空なら null（組を作らない）。
   *
   * 組は「純正 1 ＋ リサイクル N」の星形に限る。純正は何も指さず、
   * リサイクル品は純正だけを指す。リサイクル品を指せると鎖ができて、
   * どれが基準なのか分からなくなる
   */
  private async resolveGenuine(
    selfId: string,
    recycled: boolean,
    genuineId: string | null,
  ): Promise<string | null> {
    const target = genuineId?.trim() || null;
    if (target === null) return null;

    if (!recycled) {
      throw new BadRequestException(
        '純正品には「純正品」を選べません。リサイクル品・互換品にしてから選んでください',
      );
    }
    if (target === selfId) {
      throw new BadRequestException('自分自身は純正品に選べません');
    }

    const genuine = await this.prisma.toner.findUnique({
      where: { id: target },
      select: { recycled: true },
    });
    if (!genuine) {
      throw new BadRequestException(
        `純正品に選んだ ${target} は登録されていません`,
      );
    }
    if (genuine.recycled) {
      throw new BadRequestException(
        `${target} はリサイクル品・互換品です。純正品を選んでください`,
      );
    }
    return target;
  }

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
    part: SupplyPartInput;
    recycled: boolean;
    genuineId: string | null;
    hidden: boolean;
    alertThreshold: number | null;
    yieldPages: number | null;
    disabledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    alternatives: { id: string }[];
    /** 拠点ごとの在庫。**品番マスタは全拠点共通**なので拠点の数だけ並ぶ */
    stocks: { quantity: number }[];
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
      /** 種類（トナー・ドラム・廃トナーボトル…） */
      part: toner.part,
      recycled: toner.recycled,
      /** 比較の基準にする純正品。リサイクル品だけが持つ。未設定は null */
      genuineId: toner.genuineId,
      /** この品番を純正に選んでいるリサイクル品 */
      alternativeIds: toner.alternatives.map((alt) => alt.id),
      /** 他の画面（受付・注文の候補、トナー個数状況など）に出さないか */
      hidden: toner.hidden,
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
      /** 全拠点を合わせた在庫。拠点ごとの数はトナー個数状況で見る */
      stock: sumStock(toner.stocks),
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
