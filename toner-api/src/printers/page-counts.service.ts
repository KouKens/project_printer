import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { fromDate, startOfDay } from '../common/date';
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

/** 1 台あたりの結果 */
export type CaptureRow = {
  printerId: number;
  ipAddress: string;
  /** 集計対象日（YYYY-MM-DD） */
  date: string;
  /** 読み取った累計印刷枚数 */
  total: number | null;
  /** 同時点の累計モノクロ・カラー枚数。内訳を返さない機種は null */
  totalMono: number | null;
  totalColor: number | null;
  /**
   * 機能ごとの累計。**合計だけで、カラー・モノクロの内訳は機器が持っていない。**
   * 出さない機種は null（0 と区別する）
   */
  totalPrint: number | null;
  totalCopy: number | null;
  totalScan: number | null;
  /** 期間内の印刷枚数。出せないときは null */
  pages: number | null;
  monoPages: number | null;
  colorPages: number | null;
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
 * 'YYYY-MM-DD' を UTC 0 時の Date にする。
 * 画面の <input type="date"> から来る文字列をそのまま受ける。
 */
function fromDateKey(value: string, label: string): Date {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = parts
    ? new Date(
        Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])),
      )
    : null;

  if (date === null || Number.isNaN(date.getTime())) {
    throw new BadRequestException(
      `${label}は YYYY-MM-DD の形式で指定してください`,
    );
  }
  return date;
}

/**
 * 取り出す期間を決める。from / to があればその範囲、無ければ直近 days 日。
 * 日付の欠けた指定（片方だけ）も受け、欠けた側は開いたままにする。
 */
function rangeOf(days: number, from?: string, to?: string) {
  const start = from
    ? fromDateKey(from, '開始日')
    : addDays(startOfDay(new Date()), -days);
  const end = to ? fromDateKey(to, '終了日') : null;

  if (end !== null && start > end) {
    throw new BadRequestException(
      '開始日は終了日より前の日付を指定してください',
    );
  }
  return end === null ? { gte: start } : { gte: start, lte: end };
}

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
   * API プロセスが動いていないと発火しないので、常時起動でない環境では
   * タスクスケジューラから POST /api/printers/page-counts/capture を叩く。
   * 同じ日に二重に走っても upsert なので結果は変わらない。
   */
  @Cron('0 12 * * *', { name: 'capture-page-counts' })
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
      totalPrint: null,
      totalCopy: null,
      totalScan: null,
      pages: null,
      monoPages: null,
      colorPages: null,
      printPages: null,
      copyPages: null,
      scanPages: null,
      spanDays: 0,
    };

    let total: number | null;
    let totalMono: number | null;
    let totalColor: number | null;
    let totalPrint: number | null;
    let totalCopy: number | null;
    let totalScan: number | null;

    try {
      const snapshot = await this.snmp.poll(
        printer.ipAddress,
        printer.community,
        printer.version,
      );
      total = snapshot.pageCount;
      totalMono = snapshot.monoCount;
      totalColor = snapshot.colorCount;
      totalPrint = snapshot.printCount;
      totalCopy = snapshot.copyCount;
      totalScan = snapshot.scanCount;

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
    let printPages: number | null = null;
    let copyPages: number | null = null;
    let scanPages: number | null = null;
    let spanDays = 1;
    let note: string | undefined;

    if (!previous) {
      note = '初回の記録なので 1 日分は出せません';
    } else {
      spanDays = Math.max(1, diffDays(date, previous.date));
      pages = delta(total, previous.total);
      monoPages = delta(totalMono, previous.totalMono);
      colorPages = delta(totalColor, previous.totalColor);
      printPages = delta(totalPrint, previous.totalPrint);
      copyPages = delta(totalCopy, previous.totalCopy);
      scanPages = delta(totalScan, previous.totalScan);

      if (pages === null) {
        note = `カウンタが前回（${previous.total}）より小さくなっています。機器交換かリセットの可能性があります`;
      } else if (spanDays > 1) {
        note = `${spanDays} 日分をまとめた値です（前回の記録は ${fromDate(previous.date)}）`;
      }
    }

    const values = {
      total,
      totalMono,
      totalColor,
      totalPrint,
      totalCopy,
      totalScan,
      pages,
      monoPages,
      colorPages,
      printPages,
      copyPages,
      scanPages,
      spanDays,
    };

    await this.prisma.pageCountDaily.upsert({
      where: { printerId_date: { printerId: printer.id, date } },
      create: { printerId: printer.id, date, ...values, capturedAt: now },
      update: { ...values, capturedAt: now },
    });

    return { ...base, ...values, status: 'recorded', note };
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
        /**
         * カウンタの単位（prtMarkerCounterUnit）。
         * 7 / 8 なら枚、17 ならメートル。**混ぜて足さないよう画面で分ける**
         */
        counterUnit: row.printer.counterUnit,
        /** 台帳から引いた部署と管理番号。突き合わせられないときは null */
        department: asset?.department ?? null,
        no: asset?.no ?? null,
        date: fromDate(row.date),
        total: row.total,
        totalMono: row.totalMono,
        totalColor: row.totalColor,
        totalPrint: row.totalPrint,
        totalCopy: row.totalCopy,
        totalScan: row.totalScan,
        pages: row.pages,
        monoPages: row.monoPages,
        colorPages: row.colorPages,
        printPages: row.printPages,
        copyPages: row.copyPages,
        scanPages: row.scanPages,
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
      pages: row.pages,
      monoPages: row.monoPages,
      colorPages: row.colorPages,
      printPages: row.printPages,
      copyPages: row.copyPages,
      scanPages: row.scanPages,
      total: row.total,
      totalMono: row.totalMono,
      totalColor: row.totalColor,
      totalPrint: row.totalPrint,
      totalCopy: row.totalCopy,
      totalScan: row.totalScan,
      spanDays: row.spanDays,
      capturedAt: row.capturedAt,
    }));
  }

  // ── 内部ヘルパー ──────────────────────

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
