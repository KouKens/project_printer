import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { callArg, dataArg, whereArg } from '../common/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TonerOrdersService } from './toner-orders.service';

/** 突き合わせが引く 2 本のクエリを差し替える */
function prismaWith(orders: unknown[], entries: unknown[]) {
  return {
    tonerOrder: { findMany: jest.fn().mockResolvedValue(orders) },
    tonerEntry: { findMany: jest.fn().mockResolvedValue(entries) },
  };
}

const TONER = { name: 'トナー黒', color: 'BLACK' };

/** 拠点。行には id と名前・並び順が付いてくる */
const HONIN = { companyId: 1, company: { name: '本院', sortOrder: 0 } };
const BRANCH = { companyId: 2, company: { name: '事業所', sortOrder: 1 } };

describe('TonerOrdersService', () => {
  async function make(prisma: object) {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TonerOrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    return module.get(TonerOrdersService);
  }

  describe('findDeliveryCheck', () => {
    it('拠点を渡せば注文と搬入の両方をその拠点で絞る', async () => {
      const prisma = prismaWith([], []);
      const service = await make(prisma);

      await service.findDeliveryCheck(3, 90);

      const orderWhere = whereArg(prisma.tonerOrder.findMany);
      const entryWhere = whereArg(prisma.tonerEntry.findMany);
      expect(orderWhere.companyId).toBe(3);
      expect(entryWhere.companyId).toBe(3);
      // 搬入だけを見る条件は残っている
      expect(entryWhere.action).toBe('RECEIVE');
    });

    it('拠点を省けば全拠点を引く', async () => {
      const prisma = prismaWith([], []);
      const service = await make(prisma);

      await service.findDeliveryCheck(undefined, 90);

      expect(whereArg(prisma.tonerOrder.findMany)).not.toHaveProperty(
        'companyId',
      );
      expect(whereArg(prisma.tonerEntry.findMany)).not.toHaveProperty(
        'companyId',
      );
    });

    /**
     * 全拠点を並べても、拠点が鍵に入っているので混ざらない。
     * 鍵が「品番 ＋ 日付」だけだと、事業所の搬入が本院の注文を埋めて差が消える
     */
    it('同じ品番・同じ日でも拠点が違えば別の行になる', async () => {
      const service = await make(
        prismaWith(
          [
            {
              id: 1,
              ...HONIN,
              tonerId: 'T1',
              toner: TONER,
              quantity: 2,
              orderedAt: new Date('2026-09-01'),
              // 過ぎた日付。まだ来ていない「waiting」と区別する
              deliveryOn: new Date(Date.UTC(2020, 0, 5)),
              status: 'PENDING',
            },
          ],
          [
            {
              id: 10,
              ...BRANCH,
              tonerId: 'T1',
              toner: TONER,
              quantity: 2,
              userId: 'u1',
              createdAt: new Date('2020-01-05'),
              receivedOn: new Date(Date.UTC(2020, 0, 5)),
            },
          ],
        ),
      );

      const rows = await service.findDeliveryCheck(undefined, 90);

      expect(rows).toHaveLength(2);
      // 同じ日付は拠点登録の並び順（本院 → 事業所）
      expect(rows[0]).toMatchObject({
        companyId: 1,
        companyName: '本院',
        ordered: 2,
        received: 0,
        status: 'short',
      });
      expect(rows[1]).toMatchObject({
        companyId: 2,
        companyName: '事業所',
        ordered: 0,
        received: 2,
        status: 'no-order',
      });
    });

    it('注文と搬入の本数が合えば match', async () => {
      const service = await make(
        prismaWith(
          [
            {
              id: 1,
              ...HONIN,
              tonerId: 'T1',
              toner: TONER,
              quantity: 2,
              orderedAt: new Date('2026-09-01'),
              deliveryOn: new Date(Date.UTC(2026, 8, 5)),
              status: 'PENDING',
            },
          ],
          [
            {
              id: 10,
              ...HONIN,
              tonerId: 'T1',
              toner: TONER,
              quantity: 2,
              userId: 'u1',
              createdAt: new Date('2026-09-05'),
              receivedOn: new Date(Date.UTC(2026, 8, 5)),
            },
          ],
        ),
      );

      const rows = await service.findDeliveryCheck(1, 90);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        companyName: '本院',
        tonerId: 'T1',
        date: '2026-09-05',
        ordered: 2,
        received: 2,
        diff: 0,
        status: 'match',
      });
    });

    it('搬入が無ければ注文だけの行が short で残る', async () => {
      const service = await make(
        prismaWith(
          [
            {
              id: 2,
              ...BRANCH,
              tonerId: 'T1',
              toner: TONER,
              quantity: 2,
              orderedAt: new Date('2026-09-01'),
              // 過ぎた日付。まだ来ていない「waiting」と区別する
              deliveryOn: new Date(Date.UTC(2020, 0, 5)),
              status: 'PENDING',
            },
          ],
          [],
        ),
      );

      const rows = await service.findDeliveryCheck(2, 90);

      expect(rows[0]).toMatchObject({
        ordered: 2,
        received: 0,
        diff: -2,
        status: 'short',
      });
    });

    it('取り消した注文は本数に数えないが行には残す', async () => {
      const service = await make(
        prismaWith(
          [
            {
              id: 3,
              ...HONIN,
              tonerId: 'T1',
              toner: TONER,
              quantity: 5,
              orderedAt: new Date('2026-09-01'),
              deliveryOn: new Date(Date.UTC(2026, 8, 5)),
              status: 'CANCELED',
            },
          ],
          [],
        ),
      );

      const rows = await service.findDeliveryCheck(1, 90);

      expect(rows[0].ordered).toBe(0);
      expect(rows[0].orders).toHaveLength(1);
    });

    /**
     * 数が合わないまま手動で入荷済みにした行は、人が確かめたものとして片付いた扱い。
     * 「入荷済みにする」で送る先（未入荷の注文）も行ごとに返す
     */
    it('未入荷の注文の ID と、片付いたかどうかを返す', async () => {
      const order = {
        ...HONIN,
        tonerId: 'T1',
        toner: TONER,
        quantity: 1,
        orderedAt: new Date('2026-09-01'),
        deliveryOn: new Date(Date.UTC(2020, 0, 5)),
      };
      const service = await make(
        prismaWith(
          [
            { ...order, id: 1, status: 'RECEIVED', receiveMode: 'MANUAL' },
            { ...order, id: 2, status: 'PENDING', receiveMode: null },
            {
              ...order,
              id: 3,
              tonerId: 'T2',
              status: 'RECEIVED',
              receiveMode: 'MANUAL',
            },
          ],
          [],
        ),
      );

      const rows = await service.findDeliveryCheck(1, 90);
      const t1 = rows.find((row) => row.tonerId === 'T1')!;
      const t2 = rows.find((row) => row.tonerId === 'T2')!;

      expect(t1.pendingOrderIds).toEqual([2]);
      expect(t1.settled).toBe(false);
      // 搬入は無いので short のままだが、手動で入荷済みにしたので片付いている
      expect(t2.status).toBe('short');
      expect(t2.pendingOrderIds).toEqual([]);
      expect(t2.settled).toBe(true);
    });
  });

  /** 入荷済みにする・戻す。$transaction は渡した関数をそのまま走らせる */
  describe('入荷済みにする', () => {
    const SAVED = {
      id: 1,
      tonerId: 'T1',
      companyId: 1,
      userId: null,
      quantity: 2,
      orderedAt: new Date('2026-09-01'),
      deliveryOn: new Date(Date.UTC(2026, 8, 5)),
      toner: { name: 'トナー黒' },
      company: { name: '本院' },
    };

    function txWith(orders: Partial<typeof SAVED & Record<string, unknown>>[]) {
      const updateMany = jest.fn().mockResolvedValue({ count: orders.length });
      const update = jest.fn();
      const tx = {
        tonerOrder: {
          findMany: jest.fn().mockResolvedValue(orders),
          findUnique: jest.fn().mockResolvedValue(orders[0] ?? null),
          findUniqueOrThrow: jest.fn().mockResolvedValue({
            ...SAVED,
            status: 'PENDING',
            receivedAt: null,
            receiveMode: null,
          }),
          updateMany,
          update,
          // 戻したあとの突き合わせ。注文 2 本・搬入 1 本で合わない
          aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 2 } }),
        },
        tonerEntry: {
          aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 1 } }),
        },
      };
      return {
        prisma: {
          $transaction: (run: (t: object) => unknown) => run(tx),
          ...tx,
        },
        updateMany,
        update,
      };
    }

    it('未入荷の注文を手動で入荷済みにする', async () => {
      const { prisma, updateMany } = txWith([{ ...SAVED, status: 'PENDING' }]);
      const service = await make(prisma);

      await service.receive([1]);

      const call = callArg<{
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }>(updateMany);
      expect(call.where).toEqual({ id: { in: [1] } });
      expect(call.data).toMatchObject({
        status: 'RECEIVED',
        receiveMode: 'MANUAL',
      });
    });

    it('未入荷でないものが混ざっていれば全体を断る', async () => {
      const { prisma, updateMany } = txWith([{ ...SAVED, status: 'RECEIVED' }]);
      const service = await make(prisma);

      await expect(service.receive([1])).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(updateMany).not.toHaveBeenCalled();
    });

    it('無い注文を指したら 404', async () => {
      const { prisma } = txWith([]);
      const service = await make(prisma);

      await expect(service.receive([99])).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('手動で入荷済みにしたものは未入荷に戻せる', async () => {
      const { prisma, update } = txWith([
        { ...SAVED, status: 'RECEIVED', receiveMode: 'MANUAL' },
      ]);
      const service = await make(prisma);

      const result = await service.unreceive(1);

      expect(dataArg(update)).toEqual({
        status: 'PENDING',
        receiveMode: null,
        receivedAt: null,
      });
      expect(result.status).toBe('PENDING');
    });

    /** 搬入と本数が合っているので、戻してもすぐ入荷済みに決め直されてしまう */
    it('自動で入荷済みになったものは戻せない', async () => {
      const { prisma, update } = txWith([
        { ...SAVED, status: 'RECEIVED', receiveMode: 'AUTO' },
      ]);
      const service = await make(prisma);

      await expect(service.unreceive(1)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(update).not.toHaveBeenCalled();
    });
  });
});
