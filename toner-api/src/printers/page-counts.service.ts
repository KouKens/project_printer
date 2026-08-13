import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  /** date 当日の印刷枚数。出せないときは null */
  pages: number | null;
  spanDays: number;
  status: 'recorded' | 'skipped' | 'unreachable';
  note?: string;
};

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
   * 毎日 0 時 5 分に前日分を締める。
   * この時刻に読んだ累計値と前回値の差が「前日 1 日分」になる。
   *
   * API プロセスが動いていないと発火しないので、常時起動でない環境では
   * タスクスケジューラから POST /api/printers/page-counts/capture を叩く。
   * 同じ日に二重に走っても upsert なので結果は変わらない。
   */
  @Cron('5 0 * * *', { name: 'capture-page-counts' })
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

    // 読み取った時点の前日を集計対象日にする
    const date = addDays(startOfDay(now), -1);

    const base: Omit<CaptureRow, 'status' | 'total' | 'pages' | 'spanDays'> = {
      printerId: printer.id,
      ipAddress: printer.ipAddress,
      date: toDateKey(date),
    };

    let total: number | null;
    try {
      const snapshot = await this.snmp.poll(
        printer.ipAddress,
        printer.community,
        printer.version,
      );
      total = snapshot.pageCount;

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
        total: null,
        pages: null,
        spanDays: 0,
        status: 'unreachable',
        note: error.message,
      };
    }

    if (total === null) {
      return {
        ...base,
        total: null,
        pages: null,
        spanDays: 0,
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
    let spanDays = 1;
    let note: string | undefined;

    if (!previous) {
      note = '初回の記録なので前日分は出せません';
    } else {
      spanDays = Math.max(1, diffDays(date, previous.date));
      const delta = total - previous.total;

      if (delta < 0) {
        note = `カウンタが前回（${previous.total}）より小さくなっています。機器交換かリセットの可能性があります`;
      } else {
        pages = delta;
        if (spanDays > 1) {
          note = `${spanDays} 日分をまとめた値です（前回の記録は ${toDateKey(previous.date)}）`;
        }
      }
    }

    await this.prisma.pageCountDaily.upsert({
      where: { printerId_date: { printerId: printer.id, date } },
      create: {
        printerId: printer.id,
        date,
        total,
        pages,
        spanDays,
        capturedAt: now,
      },
      update: { total, pages, spanDays, capturedAt: now },
    });

    return { ...base, total, pages, spanDays, status: 'recorded', note };
  }

  /** 日次の一覧。既定は直近 30 日 */
  async findDaily(printerId: number, days = 30) {
    const from = addDays(startOfDay(new Date()), -days);

    const rows = await this.prisma.pageCountDaily.findMany({
      where: { printerId, date: { gte: from } },
      orderBy: { date: 'desc' },
    });

    return rows.map((row) => ({
      date: toDateKey(row.date),
      pages: row.pages,
      total: row.total,
      spanDays: row.spanDays,
      capturedAt: row.capturedAt,
    }));
  }
}
