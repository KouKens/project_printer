import { Test, TestingModule } from '@nestjs/testing';
import { fromDate, toDate, today } from '../common/date';
import { PrismaService } from '../prisma/prisma.service';
import {
  CostsService,
  oneOfEachFamily,
  priceOn,
  TonerCost,
} from './costs.service';

function toner(id: string, family: string, recycled: boolean): TonerCost {
  return {
    id,
    name: null,
    color: 'ブラック',
    recycled,
    family,
    prices: [{ price: 1000, effectiveFrom: toDate('2026-08-18') }],
    yieldPages: 1000,
    isColor: false,
  };
}

describe('oneOfEachFamily', () => {
  /** 純正とリサイクル品が同じ台に付いていても、減るのは片方。足すとトナー代が倍になる */
  it('組の 2 つが付いていたらリサイクル品だけを残す', () => {
    const picked = oneOfEachFamily([
      toner('P500H', 'P500H', false),
      toner('P500H-R', 'P500H', true),
    ]);
    expect(picked.map((t) => t.id)).toEqual(['P500H-R']);
  });

  it('組でない品番はそのまま残す（色違いを落とさない）', () => {
    const picked = oneOfEachFamily([
      toner('C-BK', 'C-BK', true),
      toner('C-C', 'C-C', true),
      toner('DRUM', 'DRUM', false),
    ]);
    expect(picked.map((t) => t.id)).toEqual(['C-BK', 'C-C', 'DRUM']);
  });

  it('リサイクル品どうしなら品番の若いほうを残す', () => {
    const picked = oneOfEachFamily([
      toner('G-R2', 'G', true),
      toner('G-R1', 'G', true),
    ]);
    expect(picked.map((t) => t.id)).toEqual(['G-R1']);
  });
});

/** 8/18 に 1,000 円で登録し、9/1 に 2,000 円へ改定した品番。新しい順 */
const REVISED = [
  { price: 2000, effectiveFrom: toDate('2026-09-01') },
  { price: 1000, effectiveFrom: toDate('2026-08-18') },
];

describe('priceOn', () => {
  it('その日以前で最も新しい価格を引く', () => {
    expect(priceOn(REVISED, toDate('2026-08-31'))).toBe(1000);
    expect(priceOn(REVISED, toDate('2026-09-01'))).toBe(2000);
    expect(priceOn(REVISED, toDate('2026-09-30'))).toBe(2000);
  });

  /** 最初の行の日付は登録した日にすぎない。null にすると登録前の枚数が抜ける */
  it('最初の価格より前の日は最初の価格で数える', () => {
    expect(priceOn(REVISED, toDate('2026-08-17'))).toBe(1000);
  });

  it('価格が 1 件も無ければ null', () => {
    expect(priceOn([], toDate('2026-09-01'))).toBeNull();
  });
});

describe('CostsService.find', () => {
  let service: CostsService;
  /** BK の価格の履歴。テストごとに差し替えられるよう、呼ばれた時点の値を返す */
  let prices: { price: number; effectiveFrom: Date }[];

  beforeEach(async () => {
    prices = REVISED;
    const asset = {
      id: 1,
      company: { id: 1, name: '本院' },
      department: '医事課',
      no: '001',
      ipAddress: '192.0.2.1',
      maker: 'RICOH',
      model: 'P 500',
      serialNumber: 'S1',
      purchasePrice: null,
      maintFee: null,
      maintStartOn: null,
      maintEndOn: null,
      toners: [{ tonerId: 'BK' }],
    };
    const day = (date: string, pages: number) => ({
      printerId: 10,
      date: toDate(date),
      pages,
      monoPages: pages,
      colorPages: null,
    });
    const prisma = {
      printerAsset: { findMany: jest.fn().mockResolvedValue([asset]) },
      printer: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { id: 10, ipAddress: '192.0.2.1', serialNumber: 'S1' },
          ]),
      },
      pageCountDaily: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            day('2026-08-17', 100),
            day('2026-08-20', 100),
            day('2026-09-05', 100),
          ]),
      },
      repairRecord: { findMany: jest.fn().mockResolvedValue([]) },
      toner: {
        findMany: jest.fn(() =>
          Promise.resolve([
            {
              id: 'BK',
              name: null,
              color: 'ブラック',
              recycled: false,
              genuineId: null,
              yieldPages: 1000,
              prices,
              printers: [{ printerAssetId: 1 }],
            },
          ]),
        ),
      },
      tonerEntry: {
        findMany: jest.fn().mockResolvedValue([
          // 搬入日で数える（受け付けた日時ではなく）
          {
            tonerId: 'BK',
            action: 'RECEIVE',
            quantity: 2,
            createdAt: new Date(2026, 8, 20, 12),
            receivedOn: toDate('2026-08-19'),
          },
          {
            tonerId: 'BK',
            action: 'ISSUE',
            quantity: 1,
            createdAt: new Date(2026, 7, 25, 12),
            receivedOn: null,
          },
          {
            tonerId: 'BK',
            action: 'ISSUE',
            quantity: 1,
            createdAt: new Date(2026, 8, 10, 12),
            receivedOn: null,
          },
        ]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CostsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CostsService);
  });

  /**
   * 今日の価格 1 つで数えていたときは、300 枚 × 2 円 = 600 円、
   * 持ち出し 2 本 × 2,000 円 = 4,000 円になり、改定前の期間まで新しい価格になっていた
   */
  it('改定をまたぐ期間は、枚数も受け払いもその日の価格で数える', async () => {
    const result = await service.find({ from: '2026-08-01', to: '2026-09-30' });

    const printer = result.printers[0];
    // 8/17・8/20 は 1 円/枚、9/5 は 2 円/枚
    expect(printer.catalog.tonerCost).toBe(400);
    expect(printer.catalog.baseCostPerPage).toBeCloseTo(400 / 300);
    // 8/25 は 1,000 円、9/10 は 2,000 円
    expect(printer.actual).toEqual({ tonerCost: 3000, issues: 2 });

    const row = result.toners[0];
    expect(row.price).toBe(2000);
    expect(row.pages).toBe(300);
    expect(row.expectedCost).toBe(400);
    expect(row.costPerPage).toBeCloseTo(400 / 300);
    expect(row.receivedCost).toBe(2000);
    expect(row.issuedCost).toBe(3000);
  });

  it('改定の前だけの期間なら古い価格のまま', async () => {
    const result = await service.find({ from: '2026-08-01', to: '2026-08-31' });

    expect(result.printers[0].catalog.tonerCost).toBe(200);
    expect(result.printers[0].actual).toEqual({ tonerCost: 1000, issues: 1 });
    expect(result.toners[0].price).toBe(1000);
    expect(result.toners[0].costPerPage).toBe(1);
  });

  /**
   * 刷っていない期間の単価は「期間の終わり」の価格で出すが、終わりが先の日付だと
   * まだ効いていない改定（予定）を拾ってしまう。今日で止める
   */
  it('期間の終わりが先の日付でも、予定の価格を単価に出さない', async () => {
    const day = 86_400_000;
    const at = (offset: number) => new Date(today().getTime() + offset * day);
    prices = [{ price: 9000, effectiveFrom: at(30) }, ...REVISED];

    const result = await service.find({
      from: fromDate(at(1)),
      to: fromDate(at(60)),
    });

    // 今日の価格 2,000 円 ÷ 1,000 枚。予定の 9,000 円なら 9 円になる
    expect(result.printers[0].catalog.baseCostPerPage).toBe(2);
    expect(result.printers[0].catalog.missingCost).toEqual([]);
  });
});
