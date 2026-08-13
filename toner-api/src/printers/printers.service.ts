import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrinterDto, SnmpVersionInput } from './dto/create-printer.dto';
import {
  PrinterSnapshot,
  SnmpService,
  SnmpUnreachableError,
  SnmpVersionKey,
} from './snmp.service';

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
  readings: {
    id: number;
    supplyIndex: number;
    name: string;
    colorant: string | null;
    level: number;
    maxCapacity: number;
    percent: number | null;
  }[];
};

@Injectable()
export class PrintersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly snmp: SnmpService,
  ) {}

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
      return saved;
    });

    return this.findOne(printer.id);
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
    });

    return this.findOne(id);
  }

  async findAll() {
    const printers = await this.prisma.printer.findMany({
      orderBy: { ipAddress: 'asc' },
      include: { readings: { orderBy: { supplyIndex: 'asc' } } },
    });

    return printers.map((printer) => this.toResponse(printer));
  }

  async findOne(id: number) {
    const printer = await this.prisma.printer.findUnique({
      where: { id },
      include: { readings: { orderBy: { supplyIndex: 'asc' } } },
    });

    if (!printer) {
      throw new NotFoundException(`ID ${id} のプリンターは登録されていません`);
    }
    return this.toResponse(printer);
  }

  // ── 内部ヘルパー ──────────────────────

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

  /** SNMP から取れた値だけをまとめる。取れなかった項目は null で上書きする */
  private snapshotFields(snapshot: PrinterSnapshot) {
    return {
      version: snapshot.version,
      hostName: snapshot.hostName,
      model: snapshot.model,
      serialNumber: snapshot.serialNumber,
      macAddress: snapshot.macAddress,
      pageCount: snapshot.pageCount,
      reachable: true,
      lastError: null,
      lastPolledAt: new Date(),
    };
  }

  /** 残量は履歴を持たない。毎回入れ替える */
  private async replaceReadings(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    printerId: number,
    snapshot: PrinterSnapshot,
  ) {
    await tx.supplyReading.deleteMany({ where: { printerId } });

    if (snapshot.supplies.length === 0) return;

    await tx.supplyReading.createMany({
      data: snapshot.supplies.map((supply) => ({
        printerId,
        supplyIndex: supply.supplyIndex,
        name: supply.name,
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
      readings: printer.readings.map((reading) => ({
        id: reading.id,
        supplyIndex: reading.supplyIndex,
        name: reading.name,
        colorant: reading.colorant,
        level: reading.level,
        maxCapacity: reading.maxCapacity,
        percent: reading.percent,
      })),
    };
  }
}
