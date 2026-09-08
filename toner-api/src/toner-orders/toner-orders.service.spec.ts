import { Test, TestingModule } from '@nestjs/testing';
import { whereArg } from '../common/testing';
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
    /**
     * 鍵が「品番 ＋ 日付」だけなので、拠点で絞らないと他の拠点の搬入が
     * 同じ行にまとまり、こちらの注文が埋まったように見えて差が消える
     */
    it('注文と搬入の両方を拠点で絞る', async () => {
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

    it('注文と搬入の本数が合えば match', async () => {
      const service = await make(
        prismaWith(
          [
            {
              id: 1,
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
        tonerId: 'T1',
        date: '2026-09-05',
        ordered: 2,
        received: 2,
        diff: 0,
        status: 'match',
      });
    });

    /**
     * 拠点で絞ったあとの姿。1 拠点ぶんだけが渡ってくれば、
     * 同じ品番・同じ日でも自分の注文が埋まらないまま short として残る
     */
    it('搬入が無ければ注文だけの行が short で残る', async () => {
      const service = await make(
        prismaWith(
          [
            {
              id: 2,
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
  });
});
