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
    company: { name: '本院' },
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

    /**
     * トナー入出状況は全拠点を並べて拠点を列に出す。画面の拠点一覧は有効なものだけなので、
     * 無効にした拠点の記録でも名前が出るよう、名前は履歴に添えて返す
     */
    it('拠点を省けば全拠点を引き、行に拠点名を添える', async () => {
      const findMany = jest.fn().mockResolvedValue([entry(1)]);
      const service = await make({ tonerEntry: { findMany } });

      const result = await service.findHistory({});

      const args = callArg<{ where: { companyId?: number } }>(findMany);
      expect(args.where).not.toHaveProperty('companyId');
      expect(result.rows[0]).toMatchObject({
        companyId: 1,
        companyName: '本院',
      });
    });
  });

  /** $transaction の中身をそのまま走らせる差し替え */
  function txPrisma(tx: object) {
    return {
      $transaction: (run: (t: object) => unknown) => run(tx),
      ...tx,
    };
  }

  /**
   * 在庫を減らす操作で upsert を使ってはいけない。
   *
   * Prisma の upsert は `INSERT ... ON CONFLICT DO UPDATE` になり、
   * PostgreSQL は**挿入しようとした行にも CHECK 制約を当てる**。
   * 行があって update に進む場合でも create 側の値が先に検査されるため、
   * 持ち出し（`quantity: -N`）と廃棄（`received: 0` に対する `disposed: N`）は
   * 在庫が足りていても必ず制約違反で 500 になっていた。
   */
  describe('在庫を減らす操作', () => {
    /** 在庫 5 本・搬入累計 5 本・廃棄累計 0 本の品番 */
    function stocked(update: jest.Mock, upsert: jest.Mock) {
      return txPrisma({
        toner: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'T1',
            name: 'トナー黒',
            stocks: [{ quantity: 5, received: 5, disposed: 0 }],
          }),
        },
        tonerStock: { update, upsert },
        tonerEntry: { create: jest.fn() },
      });
    }

    it('持ち出しは upsert ではなく update で減らす', async () => {
      const update = jest
        .fn()
        .mockResolvedValue({ quantity: 3, received: 5, disposed: 0 });
      const upsert = jest.fn();
      const service = await make(stocked(update, upsert));

      const result = await service.create({
        action: 'ISSUE',
        userId: 'u1',
        companyId: 1,
        tonerId: 'T1',
        quantity: 2,
      });

      expect(upsert).not.toHaveBeenCalled();
      expect(dataArg(update)).toEqual({ quantity: { increment: -2 } });
      expect(result.stock).toBe(3);
    });

    it('廃棄は upsert ではなく update で廃棄累計を増やす', async () => {
      const update = jest
        .fn()
        .mockResolvedValue({ quantity: 5, received: 5, disposed: 1 });
      const upsert = jest.fn();
      const service = await make(stocked(update, upsert));

      const result = await service.create({
        action: 'DISPOSE',
        userId: 'u1',
        companyId: 1,
        tonerId: 'T1',
        quantity: 1,
      });

      expect(upsert).not.toHaveBeenCalled();
      expect(dataArg(update)).toEqual({ disposed: { increment: 1 } });
      expect(result.disposed).toBe(1);
    });

    /**
     * 搬入は行が無いところから始まるので upsert のまま。
     * create 側の値（quantity・received が同じ正の数、disposed 0）は
     * どの CHECK にも引っかからない
     */
    it('搬入は行が無くても作れるよう upsert のまま', async () => {
      const upsert = jest
        .fn()
        .mockResolvedValue({ quantity: 2, received: 2, disposed: 0 });
      const service = await make(
        txPrisma({
          toner: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ id: 'T1', name: 'トナー黒', stocks: [] }),
          },
          tonerStock: { update: jest.fn(), upsert },
          ...ordersMatching(0, 0),
        }),
      );

      await service.create({
        action: 'RECEIVE',
        userId: 'u1',
        companyId: 1,
        tonerId: 'T1',
        quantity: 2,
      });

      const args = callArg<{
        create: { quantity: number; received: number; disposed: number };
      }>(upsert);
      expect(args.create.quantity).toBe(2);
      expect(args.create.received).toBe(2);
      expect(args.create.disposed).toBe(0);
    });
  });

  /**
   * 搬入の後に注文の入荷状態を決め直す（reconcileOrders）ための差し替え。
   * 同じ拠点・品番・日付の注文の本数と、搬入の本数（今の 1 件を含む）を返す
   */
  function ordersMatching(ordered: number, arrived: number) {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    return {
      tonerEntry: {
        create: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: arrived } }),
      },
      tonerOrder: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: ordered } }),
        updateMany,
      },
    };
  }

  describe('搬入と注文の突き合わせ', () => {
    function receiving(ordered: number, arrived: number) {
      const parts = ordersMatching(ordered, arrived);
      const prisma = txPrisma({
        toner: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ id: 'T1', name: 'トナー黒', stocks: [] }),
        },
        tonerStock: {
          upsert: jest
            .fn()
            .mockResolvedValue({ quantity: 2, received: 2, disposed: 0 }),
        },
        ...parts,
      });
      return { prisma, updateMany: parts.tonerOrder.updateMany };
    }

    it('搬入で注文と本数が合えば、その日の注文を入荷済み（自動）にする', async () => {
      const { prisma, updateMany } = receiving(2, 2);
      const service = await make(prisma);

      const result = await service.create({
        action: 'RECEIVE',
        userId: 'u1',
        companyId: 1,
        tonerId: 'T1',
        quantity: 2,
        receivedOn: '2026-10-06',
      });

      const call = callArg<{
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }>(updateMany);
      expect(call.where).toMatchObject({
        companyId: 1,
        tonerId: 'T1',
        deliveryOn: new Date(Date.UTC(2026, 9, 6)),
        status: 'PENDING',
      });
      expect(call.data).toMatchObject({
        status: 'RECEIVED',
        receiveMode: 'AUTO',
      });
      expect(result.ordersReceived).toBe(1);
    });

    it('本数が合わなければ入荷済みにしない（自動で入れたものだけ未入荷に戻す）', async () => {
      const { prisma, updateMany } = receiving(3, 2);
      const service = await make(prisma);

      const result = await service.create({
        action: 'RECEIVE',
        userId: 'u1',
        companyId: 1,
        tonerId: 'T1',
        quantity: 2,
        receivedOn: '2026-10-06',
      });

      const call = callArg<{ where: Record<string, unknown> }>(updateMany);
      expect(call.where).toMatchObject({
        status: 'RECEIVED',
        receiveMode: 'AUTO',
      });
      expect(result.ordersReceived).toBe(0);
    });
  });

  describe('remove', () => {
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

    /**
     * 搬入を取り消すと、その日の注文と本数が合わなくなる。
     * 自動で入荷済みにしていた注文はそのとき未入荷に戻す
     */
    it('搬入を取り消したら、自動で入荷済みにした注文を未入荷に戻す', async () => {
      const receivedOn = new Date(Date.UTC(2026, 9, 6));
      // 注文 2 本に対して、取り消したあとの搬入は 0 本
      const parts = ordersMatching(2, 0);
      const service = await make(
        txPrisma({
          ...parts,
          tonerEntry: {
            ...parts.tonerEntry,
            findUnique: jest.fn().mockResolvedValue({
              ...disposeEntry,
              action: 'RECEIVE',
              quantity: 2,
              receivedOn,
            }),
            delete: jest.fn(),
          },
          tonerStock: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ quantity: 2, received: 2, disposed: 0 }),
            update: jest.fn(),
          },
        }),
      );

      const result = await service.remove(5);

      const call = callArg<{
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }>(parts.tonerOrder.updateMany);
      expect(call.where).toMatchObject({
        deliveryOn: receivedOn,
        status: 'RECEIVED',
        receiveMode: 'AUTO',
      });
      expect(call.data).toMatchObject({ status: 'PENDING', receiveMode: null });
      expect(result.ordersReopened).toBe(1);
    });
  });
});
