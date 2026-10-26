import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { fromDate, parseDateKey, startOfDay } from '../common/date';
import { PrismaService } from '../prisma/prisma.service';
import {
  SnmpService,
  SnmpUnreachableError,
  SnmpVersionKey,
} from './snmp.service';

/** 部署を引くために台帳から持ってくる分 */
type LedgerAsset = {
  id: number;
  no: string | null;
  department: string | null;
  ipAddress: string | null;
  serialNumber: string | null;
};

/** 機能 × 色の 6 つ。累計にも 1 日分にも同じ形で使う */
type Matrix = {
  printMono: number | null;
  printColor: number | null;
  copyMono: number | null;
  copyColor: number | null;
  scanMono: number | null;
  scanColor: number | null;
};

/** 1 台あたりの結果 */
export type CaptureRow = {
  printerId: number;
  ipAddress: string;
  /** 集計対象日（YYYY-MM-DD） */
  date: string;
  /** 読み取った累計印刷枚数。内訳が取れる機種では累計モノクロ + 累計カラー */
  total: number | null;
  /** 同時点の累計モノクロ・カラー枚数。内訳を返さない機種は null */
  totalMono: number | null;
  totalColor: number | null;
  /** 同時点の機能 × 色の累計。出せない機種・機能は null（0 と区別する） */
  totalPrintMono: number | null;
  totalPrintColor: number | null;
  totalCopyMono: number | null;
  totalCopyColor: number | null;
  totalScanMono: number | null;
  totalScanColor: number | null;
  /** 上を足した機能ごとの累計。両方とも取れていないときだけ null */
  totalPrint: number | null;
  totalCopy: number | null;
  totalScan: number | null;
  /** 期間内の印刷枚数。出せないときは null */
  pages: number | null;
  monoPages: number | null;
  colorPages: number | null;
  printMonoPages: number | null;
  printColorPages: number | null;
  copyMonoPages: number | null;
  copyColorPages: number | null;
  scanMonoPages: number | null;
  scanColorPages: number | null;
  printPages: number | null;
  copyPages: number | null;
  scanPages: number | null;
  spanDays: number;
  status: 'recorded' | 'skipped' | 'unreachable';
  note?: string;
};

/**
 * 前回からの増分を出す。
 * 累計カウンタは単調増加なので、負なら機器交換かリセット。
 * その期間の枚数は分からないので null にする。
 */
function delta(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  const diff = current - previous;
  return diff < 0 ? null : diff;
}

/**
 * モノクロとカラーを足して機能ごとの合計にする。
 * **両方とも取れていないときだけ null。** 片方だけ取れている機種では、
 * 取れていない側を 0 と見て足す（機器が出さない = その機能でその色は刷れない）
 */
function sum(mono: number | null, color: number | null): number | null {
  if (mono === null && color === null) return null;
  return (mono ?? 0) + (color ?? 0);
}

/** 6 つの累計を機能ごとの合計 3 つに畳む。累計にも 1 日分にも同じ形で使う */
function functionTotals(matrix: Matrix) {
  return {
    print: sum(matrix.printMono, matrix.printColor),
    copy: sum(matrix.copyMono, matrix.copyColor),
    scan: sum(matrix.scanMono, matrix.scanColor),
  };
}

/**
 * startOfDay（common/date）で UTC 0 時に揃えた Date を前提に日数を足す。
 * この下の diffDays と日付キーの読み書きも、すべて UTC 成分で扱う
 */
function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** 同上。両方とも UTC 0 時に揃っているので単純に引ける */
function diffDays(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / 86_400_000);
}

/**
 * 取り出す期間を決める。from / to があればその範囲、無ければ直近 days 日。
 * 日付の欠けた指定（片方だけ）も受け、欠けた側は開いたままにする。
 */
function rangeOf(days: number, from?: string, to?: string) {
  const start = from
    ? parseDateKey(from, '開始日')
    : addDays(startOfDay(new Date()), -days);
  const end = to ? parseDateKey(to, '終了日') : null;

  if (end !== null && start > end) {
    throw new BadRequestException(
      '開始日は終了日より前の日付を指定してください',
    );
  }
  return end === null ? { gte: start } : { gte: start, lte: end };
}

/**
 * 枚数を記録する時刻。
 *
 * **残量の取り直し（`PRINTER_POLL_CRON`）と同じ時刻に置かないこと。**
 * 2 本の @Cron は並走するので、重ねると 1 台の機器に両方の SNMP が同時に届き、
 * UDP の返事が落ちて消耗品の表が後ろから欠ける。
 * 間隔は cron-schedule.spec.ts が見張っている
 */
export const PAGE_COUNT_CRON = '0 12 * * *';

@Injectable()
export class PageCountsService {
  private readonly logger = new Logger(PageCountsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly snmp: SnmpService,
  ) {}

  /**
   * 毎日 12 時ちょうどに記録する。
   *
   * 累計カウンタしか取れないので、1 日分は「前回読んだ値との差」で出す。
   * 12 時に読むと期間は前日 12 時から当日 12 時までになり、暦日とはずれる。
   * 記録する日付は読んだ日にして、その日の正午までの 24 時間分として扱う。
   *
   * **残量の取り直し（printers の pollScheduled）は 12 時 30 分に置いてある。**
   * 2 本の @Cron は並走するので、同じ時刻に置くと 1 台の機器に両方の SNMP が
   * 同時に届き、返事が落ちて表が欠ける。外から叩く運用でも同じだけ間を空ける。
   *
   * API プロセスが動いていないと発火しないので、常時起動でない環境では
   * タスクスケジューラから POST /api/printers/page-counts/capture を叩く。
   * 同じ日に二重に走っても upsert なので結果は変わらない。
   */
  @Cron(PAGE_COUNT_CRON, { name: 'capture-page-counts' })
  async captureScheduled() {
    this.logger.log('日次の印刷枚数を記録します');
    const rows = await this.captureAll();

    const recorded = rows.filter((r) => r.status === 'recorded').length;
    const failed = rows.filter((r) => r.status === 'unreachable').length;
    this.logger.log(`記録 ${recorded} 台 / 応答なし ${failed} 台`);
  }

  /**
   * 登録されている全プリンターの累計値を読んで記録する。
   * 応答がない機器があっても他は続ける。
   */
  async captureAll(now = new Date()): Promise<CaptureRow[]> {
    const printers = await this.prisma.printer.findMany({
      // 枚数を返すのは SNMP の機器だけ。SATO_ENQ は累計枚数を持たない
      where: { protocol: 'SNMP' },
      orderBy: { ipAddress: 'asc' },
    });

    const rows: CaptureRow[] = [];
    for (const printer of printers) {
      rows.push(await this.capture(printer, now));
    }
    return rows;
  }

  /** 1 台分を記録する */
  async captureOne(printerId: number, now = new Date()): Promise<CaptureRow> {
    const printer = await this.prisma.printer.findUnique({
      where: { id: printerId },
    });

    if (!printer) {
      throw new NotFoundException(
        `ID ${printerId} のプリンターは登録されていません`,
      );
    }
    return this.capture(printer, now);
  }

  /**
   * 読み取って記録する本体。
   * 全台ぶんを回すときに 1 台ずつ引き直さずに済むよう、機器の行を受け取る形にしてある
   */
  private async capture(
    printer: {
      id: number;
      ipAddress: string;
      community: string;
      version: SnmpVersionKey;
    },
    now: Date,
  ): Promise<CaptureRow> {
    // 読んだ日を集計対象日にする。その日の正午までの 24 時間分にあたる
    const date = startOfDay(now);

    const base = {
      printerId: printer.id,
      ipAddress: printer.ipAddress,
      date: fromDate(date),
    };

    const empty = {
      total: null,
      totalMono: null,
      totalColor: null,
      totalPrintMono: null,
      totalPrintColor: null,
      totalCopyMono: null,
      totalCopyColor: null,
      totalScanMono: null,
      totalScanColor: null,
      totalPrint: null,
      totalCopy: null,
      totalScan: null,
      pages: null,
      monoPages: null,
      colorPages: null,
      printMonoPages: null,
      printColorPages: null,
      copyMonoPages: null,
      copyColorPages: null,
      scanMonoPages: null,
      scanColorPages: null,
      printPages: null,
      copyPages: null,
      scanPages: null,
      spanDays: 0,
    };

    let total: number | null;
    let totalMono: number | null;
    let totalColor: number | null;
    let matrix: Matrix;

    try {
      const snapshot = await this.snmp.poll(
        printer.ipAddress,
        printer.community,
        printer.version,
      );
      total = snapshot.pageCount;
      totalMono = snapshot.monoCount;
      totalColor = snapshot.colorCount;
      matrix = {
        printMono: snapshot.printMono,
        printColor: snapshot.printColor,
        copyMono: snapshot.copyMono,
        copyColor: snapshot.copyColor,
        scanMono: snapshot.scanMono,
        scanColor: snapshot.scanColor,
      };

      await this.prisma.printer.update({
        where: { id: printer.id },
        data: {
          pageCount: snapshot.pageCount,
          reachable: true,
          lastError: null,
          lastPolledAt: now,
        },
      });
    } catch (error) {
      if (!(error instanceof SnmpUnreachableError)) throw error;

      await this.prisma.printer.update({
        where: { id: printer.id },
        data: { reachable: false, lastError: error.message, lastPolledAt: now },
      });

      return {
        ...base,
        ...empty,
        status: 'unreachable',
        note: error.message,
      };
    }

    if (total === null) {
      return {
        ...base,
        ...empty,
        status: 'skipped',
        note: 'この機種は累計印刷枚数を返しません',
      };
    }

    // 直前の記録と比べて 1 日分を出す
    const previous = await this.prisma.pageCountDaily.findFirst({
      where: { printerId: printer.id, date: { lt: date } },
      orderBy: { date: 'desc' },
    });

    let pages: number | null = null;
    let monoPages: number | null = null;
    let colorPages: number | null = null;
    let daily: Matrix = {
      printMono: null,
      printColor: null,
      copyMono: null,
      copyColor: null,
      scanMono: null,
      scanColor: null,
    };
    let spanDays = 1;
    let note: string | undefined;

    if (!previous) {
      note = '初回の記録なので 1 日分は出せません';
    } else {
      spanDays = Math.max(1, diffDays(date, previous.date));
      pages = delta(total, previous.total);
      monoPages = delta(totalMono, previous.totalMono);
      colorPages = delta(totalColor, previous.totalColor);
      daily = {
        printMono: delta(matrix.printMono, previous.totalPrintMono),
        printColor: delta(matrix.printColor, previous.totalPrintColor),
        copyMono: delta(matrix.copyMono, previous.totalCopyMono),
        copyColor: delta(matrix.copyColor, previous.totalCopyColor),
        scanMono: delta(matrix.scanMono, previous.totalScanMono),
        scanColor: delta(matrix.scanColor, previous.totalScanColor),
      };

      if (pages === null) {
        note = `カウンタが前回（${previous.total}）より小さくなっています。機器交換かリセットの可能性があります`;
      } else if (spanDays > 1) {
        note = `${spanDays} 日分をまとめた値です（前回の記録は ${fromDate(previous.date)}）`;
      }
    }

    // 保存するのは 6 つの内訳だけ。機能ごとの合計は読み出すときに足す
    const values = {
      total,
      totalMono,
      totalColor,
      totalPrintMono: matrix.printMono,
      totalPrintColor: matrix.printColor,
      totalCopyMono: matrix.copyMono,
      totalCopyColor: matrix.copyColor,
      totalScanMono: matrix.scanMono,
      totalScanColor: matrix.scanColor,
      pages,
      monoPages,
      colorPages,
      printMonoPages: daily.printMono,
      printColorPages: daily.printColor,
      copyMonoPages: daily.copyMono,
      copyColorPages: daily.copyColor,
      scanMonoPages: daily.scanMono,
      scanColorPages: daily.scanColor,
      spanDays,
    };

    await this.prisma.pageCountDaily.upsert({
      where: { printerId_date: { printerId: printer.id, date } },
      create: { printerId: printer.id, date, ...values, capturedAt: now },
      update: { ...values, capturedAt: now },
    });

    const cumulative = functionTotals(matrix);
    const period = functionTotals(daily);

    return {
      ...base,
      ...values,
      totalPrint: cumulative.print,
      totalCopy: cumulative.copy,
      totalScan: cumulative.scan,
      printPages: period.print,
      copyPages: period.copy,
      scanPages: period.scan,
      status: 'recorded',
      note,
    };
  }

  /**
   * 全機器の日次をまとめて返す。一覧画面はこれ 1 本で描く。
   * 機器ごとに叩くと台数分の往復になるため。
   */
  async findAllDaily(days = 30, from?: string, to?: string) {
    const [rows, assets] = await Promise.all([
      this.prisma.pageCountDaily.findMany({
        where: { date: rangeOf(days, from, to) },
        orderBy: [{ date: 'desc' }, { printerId: 'asc' }],
        include: {
          printer: {
            select: {
              ipAddress: true,
              model: true,
              serialNumber: true,
              counterUnit: true,
            },
          },
        },
      }),
      this.prisma.printerAsset.findMany({
        select: {
          id: true,
          no: true,
          department: true,
          ipAddress: true,
          serialNumber: true,
        },
        orderBy: [{ no: 'asc' }, { id: 'asc' }],
      }),
    ]);

    const ledger = this.ledgerIndex(assets);

    return rows.map((row) => {
      const asset = this.assetOf(row.printer, ledger);

      return {
        id: row.id,
        printerId: row.printerId,
        ipAddress: row.printer.ipAddress,
        model: row.printer.model,
        ...this.counts(row),
        /**
         * カウンタの単位（prtMarkerCounterUnit）。
         * 7 / 8 なら枚、17 ならメートル。**混ぜて足さないよう画面で分ける**
         */
        counterUnit: row.printer.counterUnit,
        /** 台帳から引いた部署と管理番号。突き合わせられないときは null */
        department: asset?.department ?? null,
        no: asset?.no ?? null,
        date: fromDate(row.date),
        spanDays: row.spanDays,
        capturedAt: row.capturedAt,
      };
    });
  }

  /** 日次の一覧。既定は直近 30 日。from / to を渡せばその期間 */
  async findDaily(printerId: number, days = 30, from?: string, to?: string) {
    const rows = await this.prisma.pageCountDaily.findMany({
      where: { printerId, date: rangeOf(days, from, to) },
      orderBy: { date: 'desc' },
    });

    return rows.map((row) => ({
      date: fromDate(row.date),
      ...this.counts(row),
      spanDays: row.spanDays,
      capturedAt: row.capturedAt,
    }));
  }

  // ── 内部ヘルパー ──────────────────────

  /**
   * 保存してある枚数を画面の形にする。
   *
   * DB に持っているのは 6 つの内訳だけで、機能ごとの合計（累計プリンターなど）は
   * ここで足して出す。**保存した合計と内訳が食い違う余地を作らないため。**
   * 記録の読み出しは 2 か所あるので、揃えられるようこの 1 か所にまとめる
   */
  private counts(row: {
    total: number;
    totalMono: number | null;
    totalColor: number | null;
    totalPrintMono: number | null;
    totalPrintColor: number | null;
    totalCopyMono: number | null;
    totalCopyColor: number | null;
    totalScanMono: number | null;
    totalScanColor: number | null;
    pages: number | null;
    monoPages: number | null;
    colorPages: number | null;
    printMonoPages: number | null;
    printColorPages: number | null;
    copyMonoPages: number | null;
    copyColorPages: number | null;
    scanMonoPages: number | null;
    scanColorPages: number | null;
  }) {
    const cumulative = functionTotals({
      printMono: row.totalPrintMono,
      printColor: row.totalPrintColor,
      copyMono: row.totalCopyMono,
      copyColor: row.totalCopyColor,
      scanMono: row.totalScanMono,
      scanColor: row.totalScanColor,
    });
    const period = functionTotals({
      printMono: row.printMonoPages,
      printColor: row.printColorPages,
      copyMono: row.copyMonoPages,
      copyColor: row.copyColorPages,
      scanMono: row.scanMonoPages,
      scanColor: row.scanColorPages,
    });

    return {
      total: row.total,
      totalMono: row.totalMono,
      totalColor: row.totalColor,
      totalPrintMono: row.totalPrintMono,
      totalPrintColor: row.totalPrintColor,
      totalCopyMono: row.totalCopyMono,
      totalCopyColor: row.totalCopyColor,
      totalScanMono: row.totalScanMono,
      totalScanColor: row.totalScanColor,
      totalPrint: cumulative.print,
      totalCopy: cumulative.copy,
      totalScan: cumulative.scan,
      pages: row.pages,
      monoPages: row.monoPages,
      colorPages: row.colorPages,
      printMonoPages: row.printMonoPages,
      printColorPages: row.printColorPages,
      copyMonoPages: row.copyMonoPages,
      copyColorPages: row.copyColorPages,
      scanMonoPages: row.scanMonoPages,
      scanColorPages: row.scanColorPages,
      printPages: period.print,
      copyPages: period.copy,
      scanPages: period.scan,
    };
  }

  /**
   * 台帳を引くための索引。シリアルと IP の 2 本を作る。
   *
   * 同じ IP を持つ台帳が複数あるので（No.041 と No.051）、IP のほうは配列で持ち、
   * 1 台に絞れないときは部署を決めない。
   */
  private ledgerIndex(assets: LedgerAsset[]) {
    const bySerial = new Map<string, LedgerAsset>();
    const byIp = new Map<string, LedgerAsset[]>();

    for (const asset of assets) {
      if (asset.serialNumber) {
        bySerial.set(asset.serialNumber.toLowerCase(), asset);
      }
      if (asset.ipAddress) {
        const list = byIp.get(asset.ipAddress) ?? [];
        list.push(asset);
        byIp.set(asset.ipAddress, list);
      }
    }
    return { bySerial, byIp };
  }

  /**
   * その実機に対応する台帳。**シリアルを先に見て、無いときだけ IP で引く。**
   * 台帳の突き合わせ（printer-assets の findOverview）と同じ順にしてある。
   * IP で複数に当たるときは、どちらの機器か決められないので null を返す。
   */
  private assetOf(
    printer: { ipAddress: string; serialNumber: string | null },
    ledger: ReturnType<PageCountsService['ledgerIndex']>,
  ): LedgerAsset | null {
    if (printer.serialNumber) {
      const bySerial = ledger.bySerial.get(printer.serialNumber.toLowerCase());
      if (bySerial) return bySerial;
    }

    const byIp = ledger.byIp.get(printer.ipAddress) ?? [];
    return byIp.length === 1 ? byIp[0] : null;
  }
}
