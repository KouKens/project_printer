import { Test, TestingModule } from '@nestjs/testing';
import { dataArg } from '../common/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RepairsService } from './repairs.service';

const SAVED = {
  id: 1,
  assignee: null,
  printerAssetId: 1,
  occurredOn: null,
  category: null,
  handledBy: 'IN_HOUSE' as const,
  detail: null,
  cost: null,
  restoredOn: null,
  status: 'DONE' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  asset: null,
};

describe('RepairsService', () => {
  let service: RepairsService;
  let update: jest.Mock;
  let create: jest.Mock;

  beforeEach(async () => {
    update = jest.fn().mockResolvedValue(SAVED);
    create = jest.fn().mockResolvedValue(SAVED);

    const prisma = {
      repairRecord: {
        findUnique: jest.fn().mockResolvedValue({ id: 1 }),
        update,
        create,
      },
      // ensureAsset が台帳を確かめる
      printerAsset: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RepairsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RepairsService);
  });

  const dataOf = dataArg;

  describe('update', () => {
    /**
     * status を送らない更新が、完了した履歴を「調査中」に戻していた。
     * 対応区分だけ直したいときにも状態が巻き戻る
     */
    it('status を送らなければ状態を変えない', async () => {
      await service.update(1, {
        printerAssetId: 1,
        handledBy: 'VENDOR',
      });

      const data = dataOf(update);
      expect(data.status).toBeUndefined();
      expect(data.handledBy).toBe('VENDOR');
    });

    it('送られてこなかった列には触らない', async () => {
      await service.update(1, {
        printerAssetId: 1,
        handledBy: 'IN_HOUSE',
      });

      const data = dataOf(update);
      expect(data.detail).toBeUndefined();
      expect(data.cost).toBeUndefined();
      expect(data.restoredOn).toBeUndefined();
      expect(data.category).toBeUndefined();
    });

    it('明示的な null は「消す」として通す', async () => {
      await service.update(1, {
        printerAssetId: 1,
        handledBy: 'IN_HOUSE',
        cost: null,
        restoredOn: null,
      });

      const data = dataOf(update);
      expect(data.cost).toBeNull();
      expect(data.restoredOn).toBeNull();
    });

    it('費用 0 は未入力と混同しない', async () => {
      // 保守で無償だった、という記録は 0 で入る
      await service.update(1, {
        printerAssetId: 1,
        handledBy: 'VENDOR',
        cost: 0,
      });

      expect(dataOf(update).cost).toBe(0);
    });
  });

  describe('create', () => {
    it('状態を選ばなければ調査中から始まる', async () => {
      await service.create({
        printerAssetId: 1,
        handledBy: 'IN_HOUSE',
      });

      const data = dataOf(create);
      expect(data.status).toBe('INVESTIGATING');
      expect(data.detail).toBeNull();
      expect(data.cost).toBeNull();
    });
  });
});
