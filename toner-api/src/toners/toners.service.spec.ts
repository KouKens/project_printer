import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { dataArg, whereArg } from '../common/testing';
import { PrismaService } from '../prisma/prisma.service';
import { monthlyPagesOf, TonersService } from './toners.service';

describe('monthlyPagesOf', () => {
  const days = (pages: (number | null)[]) => pages.map((p) => ({ pages: p }));
  /** 1 日 100 枚の日を n 日 */
  const hundreds = (n: number) => Array<number>(n).fill(100);

  it('記録のある日の平均 × 1 か月（365 ÷ 12 日）', () => {
    expect(monthlyPagesOf(days(hundreds(10)))).toBeCloseTo((100 * 365) / 12);
  });

  /** 取れなかった日を 0 枚と読むと月の枚数が小さくなり、月額の 1 枚あたりが大きく出る */
  it('枚数が null の日（累計が戻った日）は数えない', () => {
    expect(monthlyPagesOf(days([...hundreds(10), null, null]))).toBeCloseTo(
      (100 * 365) / 12,
    );
  });

  it('記録が 7 日に満たない台は出さない', () => {
    expect(monthlyPagesOf(days(hundreds(6)))).toBeNull();
  });
});

/** findUnique が返す 1 件。toResponse が読む列と _count を揃えておく */
function row(over: Record<string, unknown>) {
  return {
    id: 'X',
    name: null,
    color: null,
    recycled: false,
    genuineId: null,
    hidden: false,
    alertThreshold: null,
    yieldPages: null,
    disabledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    stocks: [],
    prices: [],
    printers: [],
    alternatives: [],
    _count: { alternatives: 0 },
    ...over,
  };
}

describe('TonersService', () => {
  let service: TonersService;
  let update: jest.Mock;
  let create: jest.Mock;
  let findMany: jest.Mock;
  /** 品番 → 登録されている行。findUnique はここから引く */
  let table: Record<string, ReturnType<typeof row>>;

  beforeEach(async () => {
    table = {
      G: row({ id: 'G' }),
      R: row({ id: 'R', recycled: true }),
      R2: row({ id: 'R2', recycled: true, genuineId: 'G' }),
    };
    update = jest.fn().mockResolvedValue({});
    // 登録したら引けるようにする（create の最後に findOne で読み直すため）
    create = jest.fn(({ data }: { data: { id: string } }) => {
      table[data.id] = row({ id: data.id });
      return Promise.resolve({});
    });
    findMany = jest.fn().mockResolvedValue([]);

    const toner = {
      findUnique: jest.fn(({ where }: { where: { id: string } }) =>
        Promise.resolve(table[where.id] ?? null),
      ),
      findMany,
      update,
      create,
    };
    const tx = {
      toner,
      tonerPrinter: { deleteMany: jest.fn(), createMany: jest.fn() },
      tonerPrice: { create: jest.fn() },
    };
    const prisma = {
      ...tx,
      $transaction: jest.fn((fn: (client: typeof tx) => Promise<unknown>) =>
        fn(tx),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TonersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TonersService);
  });

  describe('findAll', () => {
    /** 受付・注文・請求書の候補はここから作る。比較用の純正を選べてしまわないように */
    it('既定では無効と、他の画面に出さない品番を返さない', async () => {
      await service.findAll();
      expect(whereArg(findMany)).toEqual({ disabledAt: null, hidden: false });
    });

    it('トナー登録の画面には全部を返す', async () => {
      await service.findAll(true);
      expect(whereArg(findMany)).toEqual({});
    });
  });

  describe('純正品の紐づけ', () => {
    it('リサイクル品から純正を選べる', async () => {
      await service.update('R', { genuineId: 'G' });
      expect(dataArg(update).genuineId).toBe('G');
    });

    it('リサイクル品を純正として選ばせない（鎖にしない）', async () => {
      await expect(service.update('R', { genuineId: 'R2' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('自分自身は選べない', async () => {
      await expect(service.update('R', { genuineId: 'R' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('登録されていない品番は選べない', async () => {
      await expect(service.update('R', { genuineId: 'NOPE' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('純正は純正を指せない', async () => {
      await expect(
        service.create({ id: 'N', recycled: false, genuineId: 'G' }),
      ).rejects.toThrow(BadRequestException);
      expect(create).not.toHaveBeenCalled();
    });

    /** 純正に変えたのに指したまま残すと、組が食い違う */
    it('純正に変えたら、送られてこなくても純正品を外す', async () => {
      await service.update('R2', { recycled: false });
      expect(dataArg(update).genuineId).toBeNull();
    });

    it('純正として選ばれている品番はリサイクル品にできない', async () => {
      table.G = row({ id: 'G', _count: { alternatives: 1 } });
      await expect(service.update('G', { recycled: true })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('他の画面に出すか', () => {
    /** 一覧のチェックはこれだけを送る。他の列が既定値に戻ってはいけない */
    it('hidden だけを送ったら、他の列に触らない', async () => {
      await service.update('R2', { hidden: true });

      const data = dataArg(update);
      expect(data.hidden).toBe(true);
      expect(data.recycled).toBeUndefined();
      expect(data.genuineId).toBeUndefined();
      expect(data.name).toBeUndefined();
    });

    it('新規登録で指定が無ければ出す', async () => {
      await service.create({ id: 'N' });
      expect(dataArg(create).hidden).toBe(false);
    });
  });

  describe('種類', () => {
    it('新規登録で指定が無ければトナー・インク', async () => {
      await service.create({ id: 'N' });
      expect(dataArg(create).part).toBe('TONER');
    });

    it('指定した種類で登録する', async () => {
      await service.create({ id: 'D', part: 'DRUM' });
      expect(dataArg(create).part).toBe('DRUM');
    });

    /** 一覧の「表示」のチェックなど、種類を送らない更新で既定に戻してはいけない */
    it('送られてこなければ変えない', async () => {
      await service.update('R2', { hidden: true });
      expect(dataArg(update).part).toBeUndefined();
    });
  });
});
