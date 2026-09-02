import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService, Tx } from '../prisma/prisma.service';
import { BulkCreatePrintersDto } from './dto/bulk-create-printers.dto';
import { CreatePrinterDto, SnmpVersionInput } from './dto/create-printer.dto';
import { ProbePrinterDto } from './dto/probe-printer.dto';
import {
  SatoStatusService,
  SatoStatusSnapshot,
  SatoUnreachableError,
} from './sato-status.service';

import {
  PrinterSnapshot,
  SnmpService,
  SnmpUnreachableError,
  SnmpVersionKey,
} from './snmp.service';

/** 一括登録で何台まで同時に問い合わせるか */
const BULK_CONCURRENCY = 6;

/** 取り直しの 1 行分の結果 */
export type PollResultRow = {
  id: number;
  ipAddress: string;
  status: 'polled' | 'unreachable';
  message?: string;
};

/** 一括登録の 1 行分の結果 */
export type BulkResultRow = {
  ipAddress: string;
  status: 'registered' | 'failed';
  model: string | null;
  location: string | null;
  message?: string;
};

/** DB の enum とコマンドライン表記の相互変換 */
function toVersionKey(input: SnmpVersionInput | undefined): SnmpVersionKey {
  return input === '2c' ? 'V2C' : 'V1';
}

function toVersionInput(key: SnmpVersionKey): SnmpVersionInput {
  return key === 'V2C' ? '2c' : '1';
}

type PrinterRow = {
  id: number;
  ipAddress: string;
  community: string;
  version: string;
  hostName: string | null;
  model: string | null;
  serialNumber: string | null;
  macAddress: string | null;
  location: string | null;
  pageCount: number | null;
  reachable: boolean;
  lastError: string | null;
  lastPolledAt: Date | null;
  lastSuccessAt: Date | null;
  consoleText: string | null;
  readings: {
    id: number;
    supplyIndex: number;
    name: string;
    supplyType: number | null;
    supplyClass: number | null;
    colorant: string | null;
    level: number;
    maxCapacity: number;
    percent: number | null;
  }[];
  alerts: {
    id: number;
    alertIndex: number;
    severity: number | null;
    alertGroup: number | null;
    groupIndex: number | null;
    code: number | null;
    description: string | null;
  }[];
};

@Injectable()
export class PrintersService {
  private readonly logger = new Logger(PrintersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly snmp: SnmpService,
    private readonly sato: SatoStatusService,
  ) {}

  /**
   * 毎日 12 時に、登録済みの全機器の残量・警告・累計枚数を取り直す。
   *
   * これが無いと画面の残量は「誰かが取得ボタンを押したときの値」のままで、
   * 機器一覧の交換時期の色が古い値を指す。
   *
   * 枚数の記録（page-counts）と同じ時刻に走るが、
   * どちらも 1 台ずつ順に問い合わせるので機器に同時には当たらない。
   * API プロセスが動いていないと発火しないのも枚数と同じで、
   * 常時起動でない環境では POST /api/printers/poll を叩く
   */
  @Cron('0 12 * * *', { name: 'poll-printers' })
  async pollScheduled() {
    this.logger.log('全機器の残量を取り直します');
    const rows = await this.pollAll();

    const ok = rows.filter((r) => r.status === 'polled').length;
    this.logger.log(`取得 ${ok} 台 / 応答なし ${rows.length - ok} 台`);
  }

  /**
   * 登録済みの機器を順に取り直す。応答がない機器があっても続ける。
   * 応答しない IP は待ち時間ぶん伸びるので、登録と同じだけ並行して問い合わせる
   */
  async pollAll(): Promise<PollResultRow[]> {
    const printers = await this.prisma.printer.findMany({
      // SNMP で読む機器だけ。SATO_ENQ は画面から手で読んだときにしか更新しない
      where: { protocol: 'SNMP' },
      orderBy: { ipAddress: 'asc' },
      select: { id: true, ipAddress: true },
    });

    const results = await this.runPool(printers, async (printer) => {
      try {
        await this.poll(printer.id);
        return { ...printer, status: 'polled' as const };
      } catch (error) {
        // 応答がないのは平常運転。落ちた理由だけ残して次へ進む
        return {
          ...printer,
          status: 'unreachable' as const,
          message:
            error instanceof HttpException
              ? error.message
              : String((error as Error).message ?? error),
        };
      }
    });

    // 入力の並びに寄せる。IP 順で読めるように
    results.sort((a, b) => a.ipAddress.localeCompare(b.ipAddress));
    return results;
  }

  /**
   * IP アドレスを受け取って SNMP で問い合わせ、結果を DB に保存する。
   * 応答がなければ何も作らない（空の行を残しても使い道がないため）。
   * 登録済みの IP なら最新の値で上書きする。
   */
  async create(dto: CreatePrinterDto) {
    const ipAddress = dto.ipAddress.trim();
    const community = dto.community?.trim() || 'public';
    const location = dto.location?.trim() || null;

    const snapshot = await this.pollOrFail(
      ipAddress,
      community,
      toVersionKey(dto.version),
    );

    const printer = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.printer.upsert({
        where: { ipAddress },
        create: {
          ipAddress,
          community,
          location,
          ...this.snapshotFields(snapshot),
        },
        update: {
          community,
          // 設置場所は手入力。今回入力がなければ前の値を残す
          ...(location === null ? {} : { location }),
          ...this.snapshotFields(snapshot),
        },
      });

      await this.replaceReadings(tx, saved.id, snapshot);
      await this.replaceAlerts(tx, saved.id, snapshot);
      return saved;
    });

    return this.findOne(printer.id);
  }

  /**
   * 複数の IP をまとめて登録する。
   * 1 台落ちても他を続け、行ごとの結果を返す。応答がない機器は登録されない。
   *
   * 応答しない IP は待ち時間ぶんそのまま伸びるので、少しずつ並行して問い合わせる。
   * 機器 1 台に同時に投げるわけではないので、機器側の負荷は変わらない。
   */
  async createMany(dto: BulkCreatePrintersDto): Promise<BulkResultRow[]> {
    const ledger =
      dto.fillLocationFromLedger === false ? null : await this.ledgerBySerial();

    const results = await this.runPool(dto.printers, (entry) =>
      this.createOneForBulk(entry, dto.community, ledger),
    );

    // 入力の並びで返す。画面で貼り付けた順に読めるように
    const order = new Map(
      dto.printers.map((entry, index) => [entry.ipAddress, index]),
    );
    results.sort(
      (a, b) => (order.get(a.ipAddress) ?? 0) - (order.get(b.ipAddress) ?? 0),
    );
    return results;
  }

  /**
   * SNMP で問い合わせた結果をそのまま返す。**DB には一切書かない。**
   * 端末情報の手入力画面から、台帳の値と実機の今の状態を見比べるために使う。
   * 保存したいときは create() を通すこと。
   */
  async probe(dto: ProbePrinterDto) {
    const ipAddress = dto.ipAddress.trim();
    const community = dto.community?.trim() || 'public';

    const snapshot = await this.pollOrFail(
      ipAddress,
      community,
      toVersionKey(dto.version),
    );

    return {
      ipAddress,
      community,
      version: toVersionInput(snapshot.version),
      hostName: snapshot.hostName,
      model: snapshot.model,
      serialNumber: snapshot.serialNumber,
      macAddress: snapshot.macAddress,
      pageCount: snapshot.pageCount,
      polledAt: new Date(),
      // 保存しないので readings ではなく supplies。DB 由来の id は持たない
      supplies: snapshot.supplies,
    };
  }

  /**
   * メーカー拡張 MIB のカウンタ表をそのまま返す。**調べるための口。**
   *
   * どの ID がコピー・プリンター・ファクスかは機種ごとに違うため、
   * 実機の表を見ないと決められない。集計には使わない読み取り専用の経路
   */
  async dumpCounters(id: number) {
    const printer = await this.prisma.printer.findUnique({ where: { id } });
    if (!printer) {
      throw new NotFoundException(`ID ${id} のプリンターは登録されていません`);
    }

    try {
      return {
        printerId: printer.id,
        ipAddress: printer.ipAddress,
        model: printer.model,
        ...(await this.snmp.dumpCounters(
          printer.ipAddress,
          printer.community,
          printer.version,
        )),
      };
    } catch (error) {
      if (error instanceof SnmpUnreachableError) {
        throw new ServiceUnavailableException(error.message);
      }
      throw error;
    }
  }

  /** 登録済みの機器を取り直す */
  async poll(id: number) {
    const printer = await this.prisma.printer.findUnique({ where: { id } });
    if (!printer) {
      throw new NotFoundException(`ID ${id} のプリンターは登録されていません`);
    }

    let snapshot: PrinterSnapshot;
    try {
      snapshot = await this.snmp.poll(
        printer.ipAddress,
        printer.community,
        printer.version,
      );
    } catch (error) {
      if (!(error instanceof SnmpUnreachableError)) throw error;

      // 落ちていること自体が知りたい情報なので、状態は残す
      await this.prisma.printer.update({
        where: { id },
        data: {
          reachable: false,
          lastError: error.message,
          lastPolledAt: new Date(),
        },
      });
      throw new ServiceUnavailableException(error.message);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.printer.update({
        where: { id },
        data: this.snapshotFields(snapshot),
      });
      await this.replaceReadings(tx, id, snapshot);
      await this.replaceAlerts(tx, id, snapshot);
    });

    return this.findOne(id);
  }

  /**
   * SATO のステータス返送（ENQ）で 1 台読み、結果を実機マスタに残す。
   *
   * **押したときだけ呼ばれる。** protocol を SATO_ENQ にして保存するので、
   * 毎日の定期実行（pollAll / captureAll）はこの行を拾わない。
   * 状態と取得時刻は「最後に人が読んだ時点」のものになる。
   *
   * 応答が無いときは、すでにある行だけ「応答なし」に倒す。
   * 行が無いなら作らない（SNMP の create と同じで、空の行は使い道がない）
   */
  async readSato(ipAddress: string) {
    try {
      const status = await this.sato.poll(ipAddress);
      await this.saveSato(ipAddress, status);
      return status;
    } catch (error) {
      if (error instanceof SatoUnreachableError) {
        await this.prisma.printer.updateMany({
          where: { ipAddress, protocol: 'SATO_ENQ' },
          data: {
            reachable: false,
            lastError: error.message,
            lastPolledAt: new Date(),
          },
        });
      }
      throw error;
    }
  }

  async findAll() {
    const printers = await this.prisma.printer.findMany({
      orderBy: { ipAddress: 'asc' },
      include: {
        readings: { orderBy: { supplyIndex: 'asc' } },
        alerts: { orderBy: { alertIndex: 'asc' } },
      },
    });

    return printers.map((printer) => this.toResponse(printer));
  }

  async findOne(id: number) {
    const printer = await this.prisma.printer.findUnique({
      where: { id },
      include: {
        readings: { orderBy: { supplyIndex: 'asc' } },
        alerts: { orderBy: { alertIndex: 'asc' } },
      },
    });

    if (!printer) {
      throw new NotFoundException(`ID ${id} のプリンターは登録されていません`);
    }
    return this.toResponse(printer);
  }

  // ── 内部ヘルパー ──────────────────────

  /**
   * ENQ で読んだ状態を残す。
   *
   * 消耗品の残量も累計枚数も返らない機種なので、書くのは状態だけ。
   * 状態の呼び名は consoleText に入れる（機器が今出している文字、という意味で
   * 操作パネルの表示と同じ扱い）。
   *
   * 警告は**入れ替える**。SNMP の警告と同じで「今この機器が出しているもの」なので、
   * 直ったら消えるのが正しい
   */
  private async saveSato(ipAddress: string, status: SatoStatusSnapshot) {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const saved = await tx.printer.upsert({
        where: { ipAddress },
        create: {
          ipAddress,
          protocol: 'SATO_ENQ',
          consoleText: status.label,
          reachable: true,
          lastError: null,
          lastPolledAt: now,
          lastSuccessAt: now,
        },
        update: {
          protocol: 'SATO_ENQ',
          consoleText: status.label,
          reachable: true,
          lastError: null,
          lastPolledAt: now,
          lastSuccessAt: now,
        },
      });

      await tx.printerAlert.deleteMany({ where: { printerId: saved.id } });
      if (status.kind === 'ok') return;

      await tx.printerAlert.create({
        data: {
          printerId: saved.id,
          alertIndex: 1,
          // 3 が重大・4 が警告。エラー検出は重大、ニアエンドは警告に寄せる
          severity: status.kind === 'error' ? 3 : 4,
          description: status.label,
        },
      });
    });
  }

  /**
   * 少しずつ並行して処理する。
   *
   * **応答しない IP は待ち時間ぶんそのまま伸びる**ので、順に 1 台ずつだと
   * 落ちている機器の数だけ全体が延びる。機器 1 台に同時に投げるわけではないので、
   * 機器側の負荷は変わらない。
   *
   * 返る並びは終わった順。呼ぶ側で読みたい順に並べ替える
   */
  private async runPool<T, R>(
    items: T[],
    run: (item: T) => Promise<R>,
  ): Promise<R[]> {
    const results: R[] = [];
    let cursor = 0;

    const worker = async () => {
      while (cursor < items.length) {
        results.push(await run(items[cursor++]));
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(BULK_CONCURRENCY, items.length) }, worker),
    );
    return results;
  }

  /**
   * 一括登録の 1 行分。例外を投げずに結果として返す。
   * 設置場所は、行に指定があればそれを使い、無ければ台帳のシリアルから引く。
   */
  private async createOneForBulk(
    entry: { ipAddress: string; location?: string },
    community: string | undefined,
    ledger: Map<string, string> | null,
  ): Promise<BulkResultRow> {
    const ipAddress = entry.ipAddress.trim();

    try {
      const saved = await this.create({
        ipAddress,
        community,
        location: entry.location,
      });

      // 台帳の部署を入れるのは、行に指定が無く、まだ設置場所が空のときだけ。
      // 既に手入力されている値を上書きしない
      if (ledger && !entry.location && !saved.location && saved.serialNumber) {
        const department = ledger.get(saved.serialNumber.toLowerCase());
        if (department) {
          await this.prisma.printer.update({
            where: { id: saved.id },
            data: { location: department },
          });
          return { ...this.toBulkRow(saved), location: department };
        }
      }

      return this.toBulkRow(saved);
    } catch (error) {
      return {
        ipAddress,
        status: 'failed',
        model: null,
        location: null,
        message:
          error instanceof HttpException
            ? String(
                (error.getResponse() as { message?: string }).message ??
                  error.message,
              )
            : (error as Error).message,
      };
    }
  }

  private toBulkRow(saved: {
    ipAddress: string;
    model: string | null;
    location: string | null;
  }): BulkResultRow {
    return {
      ipAddress: saved.ipAddress,
      status: 'registered',
      model: saved.model,
      location: saved.location,
    };
  }

  /** シリアル（小文字）→ 部署。台帳との突き合わせは IP ではなくシリアルで行う */
  private async ledgerBySerial(): Promise<Map<string, string>> {
    const assets = await this.prisma.printerAsset.findMany({
      where: { serialNumber: { not: null }, department: { not: null } },
      select: { serialNumber: true, department: true },
    });

    const map = new Map<string, string>();
    for (const asset of assets) {
      if (asset.serialNumber && asset.department) {
        map.set(asset.serialNumber.toLowerCase(), asset.department);
      }
    }
    return map;
  }

  private async pollOrFail(
    ipAddress: string,
    community: string,
    preferred: SnmpVersionKey,
  ): Promise<PrinterSnapshot> {
    try {
      return await this.snmp.poll(ipAddress, community, preferred);
    } catch (error) {
      if (error instanceof SnmpUnreachableError) {
        throw new ServiceUnavailableException(error.message);
      }
      throw error;
    }
  }

  /**
   * 警告を入れ替える。
   *
   * 消耗品と違い、**読めなかったときも空にする**。
   * 警告は「今この機器が出しているもの」で、解消したら消えるのが正しい。
   * 残すと、直したはずの交換案内がいつまでも一覧に出続ける。
   */
  private async replaceAlerts(
    tx: Tx,
    printerId: number,
    snapshot: PrinterSnapshot,
  ) {
    await tx.printerAlert.deleteMany({ where: { printerId } });

    if (snapshot.alerts.length === 0) return;

    await tx.printerAlert.createMany({
      data: snapshot.alerts.map((alert) => ({
        printerId,
        alertIndex: alert.alertIndex,
        severity: alert.severity,
        alertGroup: alert.alertGroup,
        groupIndex: alert.groupIndex,
        code: alert.code,
        description: alert.description,
      })),
    });
  }

  /**
   * SNMP から取れた値をまとめる。
   *
   * **取れなかった項目は書かず、前回の値を残す。**
   * 機器は応答したのに表の途中で切れて機種やシリアルだけ読めない、ということが
   * 起きる。そこで null に上書きすると、一覧から機器を見分けられなくなる。
   */
  private snapshotFields(snapshot: PrinterSnapshot) {
    const now = new Date();

    return {
      version: snapshot.version,
      consoleText: snapshot.consoleText,
      ...(snapshot.hostName === null ? {} : { hostName: snapshot.hostName }),
      ...(snapshot.model === null ? {} : { model: snapshot.model }),
      ...(snapshot.serialNumber === null
        ? {}
        : { serialNumber: snapshot.serialNumber }),
      ...(snapshot.macAddress === null
        ? {}
        : { macAddress: snapshot.macAddress }),
      ...(snapshot.pageCount === null ? {} : { pageCount: snapshot.pageCount }),
      ...(snapshot.counterUnit === null
        ? {}
        : { counterUnit: snapshot.counterUnit }),
      reachable: true,
      lastError: null,
      lastPolledAt: now,
      lastSuccessAt: now,
    };
  }

  /**
   * 残量は履歴を持たないので毎回入れ替える。
   *
   * ただし今回 1 つも読めなかったときは**消さずに前回の残量を残す**。
   * 機器情報は取れても消耗品の表だけ途中で切れることがあり、
   * そこで消すと一覧から残量が消えてしまう。
   */
  private async replaceReadings(
    tx: Tx,
    printerId: number,
    snapshot: PrinterSnapshot,
  ) {
    if (snapshot.supplies.length === 0) return;

    await tx.supplyReading.deleteMany({ where: { printerId } });

    await tx.supplyReading.createMany({
      data: snapshot.supplies.map((supply) => ({
        printerId,
        supplyIndex: supply.supplyIndex,
        name: supply.name,
        supplyType: supply.supplyType,
        supplyClass: supply.supplyClass,
        colorant: supply.colorant,
        level: supply.level,
        maxCapacity: supply.maxCapacity,
        percent: supply.percent,
      })),
    });
  }

  private toResponse(printer: PrinterRow) {
    return {
      id: printer.id,
      ipAddress: printer.ipAddress,
      community: printer.community,
      version: toVersionInput(printer.version as SnmpVersionKey),
      hostName: printer.hostName,
      model: printer.model,
      serialNumber: printer.serialNumber,
      macAddress: printer.macAddress,
      location: printer.location,
      pageCount: printer.pageCount,
      reachable: printer.reachable,
      lastError: printer.lastError,
      lastPolledAt: printer.lastPolledAt,
      lastSuccessAt: printer.lastSuccessAt,
      consoleText: printer.consoleText,
      readings: printer.readings.map((reading) => ({
        id: reading.id,
        supplyIndex: reading.supplyIndex,
        name: reading.name,
        supplyType: reading.supplyType,
        supplyClass: reading.supplyClass,
        colorant: reading.colorant,
        level: reading.level,
        maxCapacity: reading.maxCapacity,
        percent: reading.percent,
      })),
      alerts: printer.alerts.map((alert) => ({
        id: alert.id,
        alertIndex: alert.alertIndex,
        severity: alert.severity,
        alertGroup: alert.alertGroup,
        groupIndex: alert.groupIndex,
        code: alert.code,
        description: alert.description,
      })),
    };
  }
}
