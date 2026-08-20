import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SnmpService, SnmpUnreachableError } from './snmp.service';

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
  /** 期間内の印刷枚数。出せないときは null */
  pages: number | null;
  monoPages: number | null;
  colorPages: number | null;
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
 * ローカルの暦日を UTC 0 時として持つ Date にする。
 *
 * `@db.Date` は Date の UTC 成分だけを見るので、ローカル 0 時を渡すと
 * JST では 9 時間戻って前日として保存されてしまう。
 * 「どの日か」はローカル時刻で決め、器は UTC 0 時に揃える。
 * 以降の addDays / diffDays / toDateKey もすべて UTC 成分で扱う。
 */
function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}

/** startOfDay で正規化済みの Date を前提に日数を足す */
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

function toDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
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
      orderBy: { ipAddress: 'asc' },
    });

    const rows: CaptureRow[] = [];
    for (const printer of printers) {
      rows.push(await this.captureOne(printer.id, now));
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

    // 読んだ日を集計対象日にする。その日の正午までの 24 時間分にあたる
    const date = startOfDay(now);

    const base = {
      printerId: printer.id,
      ipAddress: printer.ipAddress,
      date: toDateKey(date),
    };

    const empty = {
      total: null,
      totalMono: null,
      totalColor: null,
      pages: null,
      monoPages: null,
      colorPages: null,
      spanDays: 0,
    };

    let total: number | null;
    let totalMono: number | null;
    let totalColor: number | null;

    try {
      const snapshot = await this.snmp.poll(
        printer.ipAddress,
        printer.community,
        printer.version,
      );
      total = snapshot.pageCount;
      totalMono = snapshot.monoCount;
      totalColor = snapshot.colorCount;

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
    let spanDays = 1;
    let note: string | undefined;

    if (!previous) {
      note = '初回の記録なので 1 日分は出せません';
    } else {
      spanDays = Math.max(1, diffDays(date, previous.date));
      pages = delta(total, previous.total);
      monoPages = delta(totalMono, previous.totalMono);
      colorPages = delta(totalColor, previous.totalColor);

      if (pages === null) {
        note = `カウンタが前回（${previous.total}）より小さくなっています。機器交換かリセットの可能性があります`;
      } else if (spanDays > 1) {
        note = `${spanDays} 日分をまとめた値です（前回の記録は ${toDateKey(previous.date)}）`;
      }
    }

    const values = {
      total,
      totalMono,
      totalColor,
      pages,
      monoPages,
      colorPages,
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
    const rows = await this.prisma.pageCountDaily.findMany({
      where: { date: rangeOf(days, from, to) },
      orderBy: [{ date: 'desc' }, { printerId: 'asc' }],
      include: { printer: { select: { ipAddress: true, model: true } } },
    });

    return rows.map((row) => ({
      id: row.id,
      printerId: row.printerId,
      ipAddress: row.printer.ipAddress,
      model: row.printer.model,
      date: toDateKey(row.date),
      total: row.total,
      totalMono: row.totalMono,
      totalColor: row.totalColor,
      pages: row.pages,
      monoPages: row.monoPages,
      colorPages: row.colorPages,
      spanDays: row.spanDays,
      capturedAt: row.capturedAt,
    }));
  }

  /** 日次の一覧。既定は直近 30 日。from / to を渡せばその期間 */
  async findDaily(printerId: number, days = 30, from?: string, to?: string) {
    const rows = await this.prisma.pageCountDaily.findMany({
      where: { printerId, date: rangeOf(days, from, to) },
      orderBy: { date: 'desc' },
    });

    return rows.map((row) => ({
      date: toDateKey(row.date),
      pages: row.pages,
      monoPages: row.monoPages,
      colorPages: row.colorPages,
      total: row.total,
      totalMono: row.totalMono,
      totalColor: row.totalColor,
      spanDays: row.spanDays,
      capturedAt: row.capturedAt,
    }));
  }
}
