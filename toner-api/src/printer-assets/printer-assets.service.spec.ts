import { Test, TestingModule } from '@nestjs/testing';
import { callArg, dataArg } from '../common/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PrintersService } from '../printers/printers.service';
import {
  linkedToners,
  pendingByToner,
  PrinterAssetsService,
} from './printer-assets.service';

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
  dailyCheck: true,
  disabledAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/** 引き継ぎ元の候補 1 台を組み立てる。持っているトナーは品番と有効・無効だけ見る */
function source(
  maker: string | null,
  model: string | null,
  toners: { id: string; disabledAt?: Date | null }[],
  disabledAt: Date | null = null,
) {
  return {
    maker,
    model,
    disabledAt,
    toners: toners.map((toner) => ({
      toner: {
        id: toner.id,
        name: `${toner.id} のトナー`,
        disabledAt: toner.disabledAt ?? null,
      },
    })),
  };
}

describe('PrinterAssetsService', () => {
  let service: PrinterAssetsService;
  let update: jest.Mock;
  let create: jest.Mock;
  let findMany: jest.Mock;
  let linkToners: jest.Mock;
  let findUnique: jest.Mock;

  beforeEach(async () => {
    update = jest.fn().mockResolvedValue(SAVED);
    create = jest.fn().mockResolvedValue(SAVED);
    // 引き継ぎ元の候補。既定は「同じ機種の登録がまだ無い」
    findMany = jest.fn().mockResolvedValue([]);
    linkToners = jest.fn().mockResolvedValue({ count: 0 });
    findUnique = jest.fn().mockResolvedValue({ id: 1 });

    const prisma = {
      printerAsset: {
        findUnique,
        findMany,
        update,
        create,
      },
      tonerPrinter: { createMany: linkToners },
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

  /**
   * 引き継ぎ元を探した問い合わせだけを数える。
   * 台帳の findMany は**採番（全件を select）と引き継ぎ（where 付き）で共用**
   * しているので、where の有無で見分ける
   */
  const inheritLookups = () => {
    // mock.calls は any[][] なので、読む形をここで 1 度だけ宣言する
    const calls = findMany.mock.calls as [{ where?: unknown }][];
    return calls.filter((call) => call[0].where !== undefined);
  };

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

    /** 小窓の保存で毎日チェックが外れないこと。送られたときだけ変える */
    it('毎日チェックは送られたときだけ変える', async () => {
      await service.update(1, { companyId: 1 });
      expect(dataOf(update).dailyCheck).toBeUndefined();

      await service.update(1, { companyId: 1, dailyCheck: false });
      expect(dataOf(update, 1).dailyCheck).toBe(false);
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
      expect(data.dailyCheck).toBe(false);
    });
  });

  describe('setDailyCheck', () => {
    /**
     * 更新日は「実機を見て確かめた」記録。★ を押しただけで進めない。
     * Prisma は @updatedAt を update のたび今にするので、読んだ値を明示して戻す
     */
    it('印だけを変え、更新日は読んだ値のまま書き戻す', async () => {
      const checkedAt = new Date('2026-09-01T03:00:00Z');
      findUnique.mockResolvedValue({ updatedAt: checkedAt });

      const result = await service.setDailyCheck(1, true);

      expect(dataOf(update)).toEqual({
        dailyCheck: true,
        updatedAt: checkedAt,
      });
      expect(result.dailyCheck).toBe(true);
    });

    it('無い台帳は 404 にする', async () => {
      findUnique.mockResolvedValue(null);

      await expect(service.setDailyCheck(99, true)).rejects.toThrow(
        'ID 99 の端末情報は登録されていません',
      );
      expect(update).not.toHaveBeenCalled();
    });
  });

  /**
   * 管理番号は空欄で登録したときだけ、台帳全体の最大 + 1 を振る。
   * 型番を渡さない呼び方にしてあるのは、トナーの引き継ぎが先に打ち切られて
   * findMany が採番の 1 回だけになるため（同じモックを共有している）
   */
  describe('create の管理番号', () => {
    it('空欄なら台帳全体の最大 + 1 を 3 桁で入れる', async () => {
      findMany.mockResolvedValue([{ no: '092' }, { no: '911' }, { no: '041' }]);

      await service.create({ companyId: 1 });

      expect(dataOf(create).no).toBe('912');
    });

    /**
     * **プリンター登録の画面は番号を送らない**（入力欄を置いていない）。
     * ここを残してあるのは、移行や取り込みで番号を指定して入れる口のため
     */
    it('番号を指定して送ってきたらそちらを使う', async () => {
      findMany.mockResolvedValue([{ no: '911' }]);

      await service.create({ companyId: 1, no: '305' });

      expect(dataOf(create).no).toBe('305');
    });

    it('番号がまだ 1 つも無ければ 001 から始める', async () => {
      findMany.mockResolvedValue([{ no: null }, { no: '   ' }]);

      await service.create({ companyId: 1 });

      expect(dataOf(create).no).toBe('001');
    });

    /** 検証用に 'zzz-tmp' のような値が入っていても番号を出せること */
    it('数として読めない番号は最大の計算に入れない', async () => {
      findMany.mockResolvedValue([{ no: 'zzz-tmp' }, { no: '007' }]);

      await service.create({ companyId: 1 });

      expect(dataOf(create).no).toBe('008');
    });

    /**
     * 無効にした台の番号を使い回すと、修理履歴やトナーの紐づけが
     * どちらの台の記録か分からなくなる。**絞り込まずに全部読む**
     */
    it('無効にした台の番号も避ける', async () => {
      await service.create({ companyId: 1 });

      expect(callArg<{ where?: unknown }>(findMany).where).toBeUndefined();
    });

    /** 更新で振ると、画面で消した番号が保存のたび戻ってしまう */
    it('更新では番号を振らない', async () => {
      findMany.mockResolvedValue([{ no: '911' }]);

      await service.update(1, { companyId: 1 });

      expect(dataOf(update).no).toBeUndefined();
    });
  });

  /**
   * 同じ機種が既に登録されていれば、その台のトナーを新しい台にも紐づける。
   * トナー個数状況を見ながら 1 台ずつ選び直す手間をなくすための仕掛け
   */
  describe('create のトナー引き継ぎ', () => {
    it('同じ機種の台からトナーを写す', async () => {
      findMany.mockResolvedValue([
        source('RICOH', 'P C301', [{ id: 'C310H' }, { id: 'C310HC' }]),
      ]);

      const saved = await service.create({
        companyId: 1,
        maker: 'RICOH',
        model: 'P C301',
      });

      expect(linkToners).toHaveBeenCalledWith({
        data: [
          { tonerId: 'C310H', printerAssetId: 1 },
          { tonerId: 'C310HC', printerAssetId: 1 },
        ],
        skipDuplicates: true,
      });
      expect(saved.inheritedToners.toners.map((t) => t.id)).toEqual([
        'C310H',
        'C310HC',
      ]);
      expect(saved.inheritedToners.fromAssets).toBe(1);
      expect(saved.inheritedToners.model).toBe('RICOH P C301');
    });

    /** 台帳は手入力なので、同じ機種が 'P C301' と 'ｐc-301' で入っている */
    it('メーカーと型番の表記ゆれを畳んで同じ機種とみなす', async () => {
      findMany.mockResolvedValue([
        source('Ｒｉｃｏｈ', 'ｐ c-301', [{ id: 'C310H' }]),
      ]);

      const saved = await service.create({
        companyId: 1,
        maker: 'RICOH',
        model: 'P C301',
      });

      expect(saved.inheritedToners.toners.map((t) => t.id)).toEqual(['C310H']);
    });

    it('機種が違う台のトナーは写さない', async () => {
      findMany.mockResolvedValue([
        source('RICOH', 'P 501', [{ id: 'SP4500H' }]),
      ]);

      const saved = await service.create({
        companyId: 1,
        maker: 'RICOH',
        model: 'P C301',
      });

      expect(linkToners).not.toHaveBeenCalled();
      expect(saved.inheritedToners.toners).toEqual([]);
      expect(saved.inheritedToners.model).toBeNull();
    });

    /** 型番だけで畳むと、型番未入力の台がまとめて 1 機種になってしまう */
    it('型番が未入力なら何も写さない', async () => {
      findMany.mockResolvedValue([source('RICOH', null, [{ id: 'C310H' }])]);

      const saved = await service.create({ companyId: 1, maker: 'RICOH' });

      // 台帳を読むのは採番の 1 回だけで、引き継ぎ元は探しに行かない
      expect(inheritLookups()).toHaveLength(0);
      expect(linkToners).not.toHaveBeenCalled();
      expect(saved.inheritedToners.toners).toEqual([]);
    });

    it('無効にした品番は写さない', async () => {
      findMany.mockResolvedValue([
        source('RICOH', 'P C301', [
          { id: 'C310H' },
          { id: 'C310HC', disabledAt: new Date() },
        ]),
      ]);

      const saved = await service.create({
        companyId: 1,
        maker: 'RICOH',
        model: 'P C301',
      });

      expect(saved.inheritedToners.toners.map((t) => t.id)).toEqual(['C310H']);
    });

    /** 同じ機種でも台ごとに紐づけが違うことがある。足りない分を落とさない */
    it('同じ機種が複数あれば全部のトナーを合わせる', async () => {
      findMany.mockResolvedValue([
        source('RICOH', 'P C301', [{ id: 'C310H' }, { id: 'C310HC' }]),
        source('RICOH', 'P C301', [{ id: 'C310H' }, { id: 'C310HM' }]),
      ]);

      const saved = await service.create({
        companyId: 1,
        maker: 'RICOH',
        model: 'P C301',
      });

      expect(saved.inheritedToners.toners.map((t) => t.id)).toEqual([
        'C310H',
        'C310HC',
        'C310HM',
      ]);
      expect(saved.inheritedToners.fromAssets).toBe(2);
    });

    /** 入れ替えのときは、同じ機種が有効な側に 1 台も残っていない */
    it('有効な台が無ければ無効にした台から写す', async () => {
      findMany.mockResolvedValue([
        source('RICOH', 'P C301', [{ id: 'C310H' }], new Date()),
      ]);

      const saved = await service.create({
        companyId: 1,
        maker: 'RICOH',
        model: 'P C301',
      });

      expect(saved.inheritedToners.toners.map((t) => t.id)).toEqual(['C310H']);
    });

    it('有効な台があれば無効の台は見ない', async () => {
      findMany.mockResolvedValue([
        source('RICOH', 'P C301', [{ id: 'OLD' }], new Date()),
        source('RICOH', 'P C301', [{ id: 'C310H' }]),
      ]);

      const saved = await service.create({
        companyId: 1,
        maker: 'RICOH',
        model: 'P C301',
      });

      expect(saved.inheritedToners.toners.map((t) => t.id)).toEqual(['C310H']);
      expect(saved.inheritedToners.fromAssets).toBe(1);
    });
  });
});

/** 紐づけ 1 件。在庫は「拠点 ID → 本数」で渡す */
function link(
  id: string,
  color: string | null,
  stocks: Record<number, number> = {},
  extra: Partial<{
    part: 'TONER' | 'DRUM' | 'WASTE' | 'MAINTENANCE' | 'OTHER';
    recycled: boolean;
  }> = {},
) {
  return {
    toner: {
      id,
      name: `${id} の品名`,
      color,
      part: extra.part ?? ('TONER' as const),
      recycled: extra.recycled ?? false,
      alertThreshold: null,
      stocks: Object.entries(stocks).map(([companyId, quantity]) => ({
        companyId: Number(companyId),
        quantity,
      })),
    },
  };
}

describe('linkedToners', () => {
  /** 他の拠点の在庫は取りに行けるとは限らないので足さない */
  it('在庫は台の拠点の行だけを見る。行が無ければ 0', () => {
    const [toner] = linkedToners(
      [link('IP04KA', 'ブラック', { 4: 2, 5: 9 })],
      4,
    );
    expect(toner.stock).toBe(2);

    const [other] = linkedToners([link('IP04KA', 'ブラック', { 5: 9 })], 4);
    expect(other.stock).toBe(0);
  });

  /** 在庫と同じく、台の拠点の未入荷の注文だけを数える */
  it('注文中は台の拠点の未入荷の本数。無ければ 0', () => {
    const pending = pendingByToner([
      { tonerId: 'IP04KA', companyId: 4, _sum: { quantity: 3 } },
      { tonerId: 'IP04KA', companyId: 5, _sum: { quantity: 7 } },
    ]);

    const [here] = linkedToners([link('IP04KA', 'ブラック')], 4, pending);
    expect(here.onOrder).toBe(3);

    const [none] = linkedToners([link('PXMB8', null)], 4, pending);
    expect(none.onOrder).toBe(0);
  });

  it('トナー・インクを先に K C M Y、部品はその後に並べる', () => {
    const rows = linkedToners(
      [
        link('廃トナーボトル', null, {}, { part: 'WASTE' }),
        link('C310H-Y', 'イエロー'),
        link('C310H-C', 'シアン'),
        link('C310H-BK', 'ブラック'),
        link('C310H-M', 'マゼンタ'),
      ],
      4,
    );
    expect(rows.map((row) => row.id)).toEqual([
      'C310H-BK',
      'C310H-C',
      'C310H-M',
      'C310H-Y',
      '廃トナーボトル',
    ]);
  });

  it('同じ色は純正を先に置き、色欄を K C M Y の名前に畳んで返す', () => {
    const rows = linkedToners(
      [
        link('R-BK', 'ブラック', {}, { recycled: true }),
        link('G-BK', 'ブラック'),
      ],
      4,
    );
    expect(rows.map((row) => row.id)).toEqual(['G-BK', 'R-BK']);
    expect(rows[0].colors).toEqual(['black']);
  });
});
