import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { dataArg } from '../common/testing';
import {
  costPerPageOf,
  orderUnitsOf,
  shippingPerPageOf,
  toModels,
  TonerOffersService,
  unitPriceOf,
} from './toner-offers.service';

describe('1 本あたり・1 枚あたり', () => {
  const base = {
    price: 14000,
    packQuantity: 2,
    yieldPages: 7000,
    pagePrice: null,
    shippingFee: null,
    minOrder: null,
  };

  it('1 本あたりは価格 ÷ 入数', () => {
    expect(unitPriceOf(base)).toBe(7000);
  });

  it('1 枚あたりは 1 本あたり ÷ 印刷可能枚数', () => {
    expect(costPerPageOf(base)).toBe(1);
  });

  /** 枚数で払う買い方では、払うのは 1 枚ごとの料金 */
  it('カウンター料金があればそちらを使う', () => {
    expect(costPerPageOf({ ...base, pagePrice: 0.8 })).toBe(0.8);
    expect(costPerPageOf({ ...base, price: null, pagePrice: 0.8 })).toBe(0.8);
  });

  it('価格か枚数が無ければ出さない', () => {
    expect(costPerPageOf({ ...base, price: null })).toBeNull();
    expect(costPerPageOf({ ...base, yieldPages: null })).toBeNull();
  });

  /** 送料 ÷（1 回に頼む本数 × 印刷可能枚数）を本体に足す */
  it('送料は 1 回の注文の本数で割って足す', () => {
    // 1 箱（2 本）で 1,400 円 → 1,400 ÷ (2 × 7,000) = 0.1 円/枚
    expect(shippingPerPageOf({ ...base, shippingFee: 1400 })).toBeCloseTo(0.1);
    expect(costPerPageOf({ ...base, shippingFee: 1400 })).toBeCloseTo(1.1);
    // 最小 4 本なら 4 本で割る
    expect(orderUnitsOf({ ...base, minOrder: 4 })).toBe(4);
    expect(
      shippingPerPageOf({ ...base, shippingFee: 1400, minOrder: 4 }),
    ).toBeCloseTo(0.05);
  });

  /** 箱は割って買えないので、最小注文数が入数より少なくても 1 箱は頼む */
  it('1 回に頼む本数は入数を下回らない', () => {
    expect(orderUnitsOf({ ...base, minOrder: 1 })).toBe(2);
  });

  it('送料が無ければ 0、印刷可能枚数が無くて割れなければ null（本体には足さない）', () => {
    expect(shippingPerPageOf({ ...base, shippingFee: 0 })).toBe(0);
    const counter = {
      ...base,
      yieldPages: null,
      pagePrice: 0.8,
      shippingFee: 500,
    };
    expect(shippingPerPageOf(counter)).toBeNull();
    expect(costPerPageOf(counter)).toBe(0.8);
  });
});

describe('toModels', () => {
  /** 比較では同じ機種なので、両方付けても 1 つにする */
  it('畳んで同じ機種になるものは 1 つにまとめ、空の型番は落とす', () => {
    expect(
      toModels([
        { maker: 'RICOH', model: 'P 500' },
        { maker: 'ricoh', model: 'P500' },
        { maker: 'RICOH', model: '  ' },
        { maker: ' ', model: 'LBP221' },
      ]),
    ).toEqual([
      { maker: 'RICOH', model: 'P 500' },
      { maker: null, model: 'LBP221' },
    ]);
  });
});

describe('TonerOffersService', () => {
  let service: TonerOffersService;
  let create: jest.Mock;
  let update: jest.Mock;
  let deleteMany: jest.Mock;
  let createMany: jest.Mock;

  /** 保存済みの 1 件。findUnique はこれを返す */
  const saved = {
    id: 1,
    code: 'P500H-R',
    name: null,
    brand: null,
    kind: 'RECYCLED' as const,
    part: 'TONER' as const,
    color: 'ブラック',
    yieldPages: 20000,
    packQuantity: 1,
    seller: 'エコ事務機',
    purchaseType: 'SPOT' as const,
    price: 8000,
    pagePrice: null,
    monthlyFee: null,
    shippingFee: null,
    minOrder: null,
    leadTime: null,
    warranty: null,
    takesBack: true,
    payment: null,
    quotedOn: null,
    validUntil: null,
    reference: null,
    url: null,
    contact: null,
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    models: [
      { maker: 'RICOH', model: 'P500' },
      { maker: 'Canon', model: 'LBP9999' },
    ],
  };

  beforeEach(async () => {
    create = jest.fn().mockResolvedValue({ id: 1 });
    update = jest.fn().mockResolvedValue({});
    deleteMany = jest.fn().mockResolvedValue({});
    createMany = jest.fn().mockResolvedValue({});

    const tx = {
      tonerOffer: { update },
      tonerOfferModel: { deleteMany, createMany },
    };
    /** トナー登録。無効にした品番と、他の画面に出さない品番を 1 つずつ混ぜる */
    const masters = [
      { id: 'p500h-r', disabledAt: null, hidden: false },
      { id: 'OLD-1', disabledAt: new Date(), hidden: false },
      { id: 'HID-1', disabledAt: null, hidden: true },
    ];
    type TonerWhere = { disabledAt?: null; hidden?: boolean };
    const prisma = {
      tonerOffer: {
        create,
        findUnique: jest.fn().mockResolvedValue(saved),
        findMany: jest
          .fn()
          .mockResolvedValue([
            saved,
            { ...saved, id: 2, code: 'old-1' },
            { ...saved, id: 3, code: 'HID-1' },
          ]),
      },
      // 有効な台帳。型番の無い台は機種として数えない
      printerAsset: {
        findMany: jest.fn().mockResolvedValue([
          { maker: 'RICOH', model: 'P 500' },
          { maker: 'RICOH', model: 'P 500' },
          { maker: 'ＲＩＣＯＨ', model: 'P500' },
          { maker: 'RICOH', model: null },
        ]),
      },
      // where を見て絞る（無効・他の画面に出さない品番を外したかを、結果で確かめるため）
      toner: {
        findMany: jest.fn(
          ({
            where,
            select,
          }: {
            where?: TonerWhere;
            select: Record<string, true>;
          }) =>
            Promise.resolve(
              select.color
                ? [{ color: 'ブラック' }, { color: 'ブラック' }]
                : masters
                    .filter(
                      (m) =>
                        (where?.disabledAt !== null || m.disabledAt === null) &&
                        (where?.hidden === undefined ||
                          m.hidden === where.hidden),
                    )
                    .map((m) => ({ id: m.id })),
            ),
        ),
      },
      $transaction: jest.fn((fn: (client: typeof tx) => Promise<unknown>) =>
        fn(tx),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TonerOffersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TonerOffersService);
  });

  describe('findAll', () => {
    it('台帳の機種は表記ゆれを畳んで数え、型番の無い台は出さない', async () => {
      const result = await service.findAll();
      expect(result.models).toEqual([
        expect.objectContaining({
          maker: 'RICOH',
          model: 'P 500',
          label: 'RICOH P 500',
          assetCount: 3,
        }),
      ]);
    });

    it('使える機種に台帳の台数を添える（無い機種は 0）', async () => {
      const [offer] = (await service.findAll()).offers;
      expect(offer.models.map((m) => [m.label, m.assetCount])).toEqual([
        ['RICOH P500', 3],
        ['Canon LBP9999', 0],
      ]);
    });

    /** 今使っている品番を別の店で買う値段、と分かるように */
    it('トナー登録に同じ品番があれば、畳んで突き合わせて返す', async () => {
      const [offer] = (await service.findAll()).offers;
      expect(offer.masterId).toBe('p500h-r');
      expect(offer.costPerPage).toBe(0.4);
      expect(offer.shippingPerPage).toBe(0);
      expect(offer.orderUnits).toBe(1);
    });

    /** 「使用中の品番」と出すので、止めた品番・他の画面に出さない品番には結ばない */
    it('無効にした品番と他の画面に出さない品番とは突き合わせない', async () => {
      const { offers } = await service.findAll();
      expect(offers.map((o) => o.masterId)).toEqual(['p500h-r', null, null]);
    });
  });

  describe('create', () => {
    it('送らなかった項目は既定値で作る', async () => {
      await service.create({
        code: ' X1 ',
        seller: ' 店 ',
      });
      expect(dataArg(create)).toMatchObject({
        code: 'X1',
        seller: '店',
        kind: 'GENUINE',
        part: 'TONER',
        packQuantity: 1,
        purchaseType: 'SPOT',
        price: null,
        models: { create: [] },
      });
    });

    it('有効期限が確かめた日より前なら断る', async () => {
      await expect(
        service.create({
          code: 'X1',
          seller: '店',
          quotedOn: '2026-10-01',
          validUntil: '2026-09-30',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    /** 未指定を既定値に戻すと、入力欄の無い列が保存のたび消える（countLayout の事故と同じ） */
    it('送られてこなかった項目と機種には触らない', async () => {
      await service.update(1, {
        code: 'P500H-R',
        seller: 'エコ事務機',
        price: 7500,
      });
      const data = dataArg(update);
      expect(data.price).toBe(7500);
      expect(data.kind).toBeUndefined();
      expect(data.part).toBeUndefined();
      expect(data.packQuantity).toBeUndefined();
      expect(data.takesBack).toBeUndefined();
      expect(deleteMany).not.toHaveBeenCalled();
    });

    it('null を送った項目は消す', async () => {
      await service.update(1, {
        code: 'P500H-R',
        seller: 'エコ事務機',
        takesBack: null,
      });
      expect(dataArg(update).takesBack).toBeNull();
    });

    it('機種の配列が来たら入れ替える', async () => {
      await service.update(1, {
        code: 'P500H-R',
        seller: 'エコ事務機',
        models: [{ maker: 'RICOH', model: 'P 501' }],
      });
      expect(deleteMany).toHaveBeenCalledWith({ where: { offerId: 1 } });
      expect(createMany).toHaveBeenCalledWith({
        data: [{ maker: 'RICOH', model: 'P 501', offerId: 1 }],
      });
    });
  });
});
