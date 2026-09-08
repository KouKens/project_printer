import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintVendorDto } from './dto/create-maint-vendor.dto';
import { makerKey, MaintVendorsService } from './maint-vendors.service';

describe('makerKey', () => {
  it('前後の空白を落とす', () => {
    expect(makerKey('  Ricoh  ')).toBe('ricoh');
  });

  it('大文字小文字を畳む', () => {
    expect(makerKey('RICOH')).toBe(makerKey('Ricoh'));
    expect(makerKey('ricoh')).toBe(makerKey('Ricoh'));
  });

  /**
   * 画面側の入力候補（lib/suggest.ts の foldKey）と同じ畳み方にする。
   * 片方だけ全角を畳むと、候補では 1 件に見えるのに DB では別物になる
   */
  it('全角英字を畳む', () => {
    expect(makerKey('ＲＩＣＯＨ')).toBe(makerKey('Ricoh'));
    expect(makerKey('ＥＰＳＯＮ')).toBe(makerKey('EPSON'));
  });

  it('半角カナを畳む', () => {
    expect(makerKey('ｷﾔﾉﾝ')).toBe(makerKey('キヤノン'));
  });

  it('別のメーカーまで畳まない', () => {
    expect(makerKey('Canon')).not.toBe(makerKey('Cannon'));
    expect(makerKey('EPSON')).not.toBe(makerKey('KYOCERA'));
  });
});

describe('MaintVendorsService', () => {
  /** 既に登録されている業者を差し替えて、重複判定だけを見る */
  async function make(others: { name: string; makers: string[] }[]) {
    const prisma = {
      maintVendor: {
        // ensureMakersFree が既存の業者を引く
        findMany: jest.fn().mockResolvedValue(others),
        // ensureNameFree が会社名の重複を見る。名前は空いている前提
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 1,
          name: '新しい業者',
          phones: [],
          makers: [],
          note: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          assets: [],
        }),
      },
      // makerAssetCounts が「業者未指定の機器」を数える
      printerAsset: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintVendorsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    return module.get(MaintVendorsService);
  }

  const dto = (makers: string[]) =>
    ({ name: '新しい業者', makers }) as CreateMaintVendorDto;

  /**
   * 1 つのメーカーを 2 社が既定に名乗ることはできない。
   * **表記が違うだけの同じメーカーも同じ扱いにする。**
   * 畳まないと ＲＩＣＯＨ と Ricoh を別々の会社が名乗れてしまい、
   * どちらに連絡するのかが機器ごとの表記で決まってしまう
   */
  it('表記が違うだけの既定は重複として断る', async () => {
    const service = await make([{ name: '既存の業者', makers: ['Ricoh'] }]);

    await expect(service.create(dto(['ＲＩＣＯＨ']))).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.create(dto(['RICOH']))).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('別のメーカーなら通す', async () => {
    const service = await make([{ name: '既存の業者', makers: ['Ricoh'] }]);

    await expect(service.create(dto(['EPSON']))).resolves.toBeDefined();
  });

  it('既定を持たない業者は重複を見ない', async () => {
    const service = await make([{ name: '既存の業者', makers: ['Ricoh'] }]);

    await expect(service.create(dto([]))).resolves.toBeDefined();
  });
});
