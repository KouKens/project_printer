import { Test, TestingModule } from '@nestjs/testing';
import { dataArg } from '../common/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PrintersService } from '../printers/printers.service';
import { PrinterAssetsService } from './printer-assets.service';

/** update に渡された data だけ見たいので、保存結果は使い回しの 1 件で足りる */
const SAVED = {
  id: 1,
  companyId: 1,
  company: { id: 1, name: '本院' },
  department: '医事課',
  no: 'P-01',
  ipAddress: '192.168.1.10',
  maker: 'RICOH',
  model: 'P C301',
  serialNumber: 'ABC123',
  purchasedOn: null,
  purchasePrice: null,
  contractNo: null,
  maintVendorId: null,
  maintVendor: null,
  maintContract: null,
  maintStartOn: null,
  maintEndOn: null,
  maintDealOn: null,
  maintFee: null,
  note: null,
  countLayout: 'MONO_COLOR' as const,
  disabledAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PrinterAssetsService', () => {
  let service: PrinterAssetsService;
  let update: jest.Mock;
  let create: jest.Mock;

  beforeEach(async () => {
    update = jest.fn().mockResolvedValue(SAVED);
    create = jest.fn().mockResolvedValue(SAVED);

    const prisma = {
      printerAsset: {
        findUnique: jest.fn().mockResolvedValue({ id: 1 }),
        update,
        create,
      },
      // toResponse がメーカー既定の業者を引く。空で足りる
      maintVendor: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrinterAssetsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PrintersService, useValue: {} },
      ],
    }).compile();

    service = module.get(PrinterAssetsService);
  });

  const dataOf = dataArg;

  describe('update', () => {
    /**
     * 画面のフォームに入力欄が無い列を、保存のたび既定値に戻さないこと。
     * countLayout が実際に保存のたび TOTAL へ戻っていた
     */
    it('送られてこなかった列には触らない', async () => {
      await service.update(1, { companyId: 1 });

      const data = dataOf(update);
      expect(data.countLayout).toBeUndefined();
      expect(data.maker).toBeUndefined();
      expect(data.note).toBeUndefined();
      expect(data.maintEndOn).toBeUndefined();
      // 拠点は必須なので常に入る
      expect(data.companyId).toBe(1);
    });

    it('明示的な null は「消す」として通す', async () => {
      await service.update(1, {
        companyId: 1,
        note: null,
        maintVendorId: null,
        maintEndOn: null,
      });

      const data = dataOf(update);
      expect(data.note).toBeNull();
      expect(data.maintVendorId).toBeNull();
      expect(data.maintEndOn).toBeNull();
    });

    it('送られた値は前後の空白を落として入る', async () => {
      await service.update(1, {
        companyId: 1,
        maker: '  RICOH  ',
        countLayout: 'COLOR_MONO',
      });

      const data = dataOf(update);
      expect(data.maker).toBe('RICOH');
      expect(data.countLayout).toBe('COLOR_MONO');
    });

    it('空白だけの入力は未入力として null になる', async () => {
      await service.update(1, {
        companyId: 1,
        note: '   ',
      });

      expect(dataOf(update).note).toBeNull();
    });
  });

  describe('create', () => {
    /** 新規は行を作るので全列を埋める。ここは undefined を残さない */
    it('未指定の列は既定値で埋める', async () => {
      await service.create({ companyId: 1 });

      const data = dataOf(create);
      expect(data.countLayout).toBe('TOTAL');
      expect(data.maker).toBeNull();
      expect(data.note).toBeNull();
      expect(data.maintFee).toBeNull();
    });
  });
});
