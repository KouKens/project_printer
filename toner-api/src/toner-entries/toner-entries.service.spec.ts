import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { callArg, dataArg } from '../common/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HISTORY_LIMIT, TonerEntriesService } from './toner-entries.service';

/** 履歴 1 件ぶんの器。findHistory は件数しか見ないので中身は使い回す */
function entry(id: number) {
  return {
    id,
    userId: 'u1',
    tonerId: 'T1',
    companyId: 1,
    toner: { name: 'トナー黒', color: 'BLACK' },
    action: 'RECEIVE',
    quantity: 1,
    balance: 1,
    receivedOn: null,
    createdAt: new Date(),
  };
}

describe('TonerEntriesService', () => {
  async function make(prisma: object) {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TonerEntriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    return module.get(TonerEntriesService);
  }

  describe('findHistory', () => {
    /**
     * 黙って打ち切ると、並んだものがその期間の全部だと読めてしまう。
     * 上限より 1 件多く引いて、続きがあるかどうかを返す
     */
    it('上限を超えたら truncated を立て、上限ぶんだけ返す', async () => {
      const rows = Array.from({ length: HISTORY_LIMIT + 1 }, (_, i) =>
        entry(i),
      );
      const service = await make({
        tonerEntry: { findMany: jest.fn().mockResolvedValue(rows) },
      });

      const result = await service.findHistory({});

      expect(result.truncated).toBe(true);
      expect(result.limit).toBe(HISTORY_LIMIT);
      // 判定用に 1 件多く引いているので、返す側でそれを落とす
      expect(result.rows).toHaveLength(HISTORY_LIMIT);
    });

    it('上限ちょうどなら truncated は立てない', async () => {
      const rows = Array.from({ length: HISTORY_LIMIT }, (_, i) => entry(i));
      const service = await make({
        tonerEntry: { findMany: jest.fn().mockResolvedValue(rows) },
      });

      const result = await service.findHistory({});

      expect(result.truncated).toBe(false);
      expect(result.rows).toHaveLength(HISTORY_LIMIT);
    });

    it('判定のため上限より 1 件多く引く', async () => {
      const findMany = jest.fn().mockResolvedValue([]);
      const service = await make({ tonerEntry: { findMany } });

      await service.findHistory({ companyId: 2, action: 'ISSUE' });

      const args = callArg<{
        take: number;
        where: { companyId?: number; action?: string };
      }>(findMany);
      expect(args.take).toBe(HISTORY_LIMIT + 1);
      expect(args.where.companyId).toBe(2);
      expect(args.where.action).toBe('ISSUE');
    });
  });

  describe('remove', () => {
    /** $transaction の中身をそのまま走らせる差し替え */
    function txPrisma(tx: object) {
      return {
        $transaction: (run: (t: object) => unknown) => run(tx),
        ...tx,
      };
    }

    const disposeEntry = {
      id: 5,
      tonerId: 'T1',
      companyId: 1,
      action: 'DISPOSE',
      quantity: 3,
      toner: { name: 'トナー黒' },
    };

    /**
     * 以前は Math.min で黙って辻褄を合わせていた。
     * 取り消したはずの本数が戻らないまま「成功」として返るので、
     * 履歴と在庫の食い違いに気づけない
     */
    it('廃棄累計より多く戻そうとしたら断る', async () => {
      const service = await make(
        txPrisma({
          tonerEntry: {
            findUnique: jest.fn().mockResolvedValue(disposeEntry),
            delete: jest.fn(),
          },
          tonerStock: {
            // 3 本の廃棄を取り消したいのに、累計は 1 本しかない
            findUnique: jest
              .fn()
              .mockResolvedValue({ quantity: 0, received: 5, disposed: 1 }),
            update: jest.fn(),
          },
        }),
      );

      await expect(service.remove(5)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
    });

    it('筋が通れば廃棄累計をそのぶん戻す', async () => {
      const update = jest.fn();
      const remove = jest.fn();
      const service = await make(
        txPrisma({
          tonerEntry: {
            findUnique: jest.fn().mockResolvedValue(disposeEntry),
            delete: remove,
          },
          tonerStock: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ quantity: 0, received: 5, disposed: 3 }),
            update,
          },
        }),
      );

      await service.remove(5);

      // Math.min で丸めず、記録どおりの本数を戻す
      expect(dataArg(update)).toEqual({ disposed: { decrement: 3 } });
      expect(remove).toHaveBeenCalled();
    });

    it('棚卸しの調整は取り消せない', async () => {
      const service = await make(
        txPrisma({
          tonerEntry: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ ...disposeEntry, action: 'ADJUST' }),
            delete: jest.fn(),
          },
          tonerStock: { findUnique: jest.fn(), update: jest.fn() },
        }),
      );

      await expect(service.remove(5)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
    });
  });
});
