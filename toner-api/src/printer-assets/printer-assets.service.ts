import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrinterAssetDto } from './dto/create-printer-asset.dto';

/**
 * @db.Date の列にローカル 0 時の Date を渡すと JST では前日にずれる。
 * UTC 成分しか見られないので、UTC の 0 時で作る。
 */
function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** 読むときも UTC 成分で取り出す。画面の <input type="date"> にそのまま入る形 */
function fromDate(value: Date | null): string | null {
  if (!value) return null;
  const month = `${value.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${value.getUTCDate()}`.padStart(2, '0');
  return `${value.getUTCFullYear()}-${month}-${day}`;
}

/** 空文字は未入力として扱う。画面から '' が来ても null で揃える */
function toText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** 修理履歴のうち、一覧の集計に要る分だけ */
type RepairSlice = {
  printerAssetId: number;
  handledBy: 'IN_HOUSE' | 'VENDOR';
  restoredOn: Date;
  status: string;
};

/**
 * 復旧日が保守期間の中に入っているか。
 * 開始・終了のうち入っている側だけを見る（片方だけの台帳があるため）。
 * どちらも無い台帳は期間が決まらないので、呼ぶ側で数えない
 */
function withinMaint(
  restoredOn: Date,
  start: Date | null,
  end: Date | null,
): boolean {
  if (start && restoredOn < start) return false;
  if (end && restoredOn > end) return false;
  return true;
}

type AssetRow = {
  id: number;
  department: string | null;
  no: string | null;
  ipAddress: string | null;
  maker: string | null;
  model: string | null;
  serialNumber: string | null;
  purchasedOn: Date | null;
  contractNo: string | null;
  maintContract: string | null;
  maintStartOn: Date | null;
  maintEndOn: Date | null;
  maintDealOn: Date | null;
  maintFee: number | null;
  note: string | null;
  countLayout: 'TOTAL' | 'MONO_COLOR' | 'COLOR_MONO';
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrinterAssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePrinterAssetDto) {
    const saved = await this.prisma.printerAsset.create({
      data: this.toData(dto),
    });
    return this.toResponse(saved);
  }

  async findAll() {
    const assets = await this.prisma.printerAsset.findMany({
      orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
    });
    return assets.map((asset) => this.toResponse(asset));
  }

  /**
   * 台帳を主にして、実機の情報と直近の印刷枚数をぶら下げて返す。
   *
   * 台帳と機器は別のテーブルで外部キーも無いので、ここで突き合わせる。
   * **シリアルを先に見て、台帳にシリアルが無いときだけ IP で引く。**
   * 同じ IP に 2 台ぶら下がっている台帳（No.041 と No.051）があり、
   * IP を先に見ると、実機が 1 台しか無いのに両方へ同じ情報が付いてしまう。
   *
   * 取れないものは null で返す。画面はそれを空欄として出す。
   */
  async findOverview() {
    const [assets, printers, dailies, repairs] = await Promise.all([
      this.prisma.printerAsset.findMany({
        orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.printer.findMany({
        include: {
          readings: { orderBy: { supplyIndex: 'asc' } },
          alerts: { orderBy: { alertIndex: 'asc' } },
        },
      }),
      // 機器ごとの最新 1 件だけ要る。日付の新しい順に見て最初に出たものを採る
      this.prisma.pageCountDaily.findMany({ orderBy: { date: 'desc' } }),
      // 修理は台帳に紐づくので、台帳ごとに数え直す
      this.prisma.repairRecord.findMany({
        select: {
          printerAssetId: true,
          handledBy: true,
          restoredOn: true,
          status: true,
        },
      }),
    ]);

    const bySerial = new Map<string, (typeof printers)[number]>();
    const byIp = new Map<string, (typeof printers)[number]>();
    for (const printer of printers) {
      if (printer.serialNumber) {
        bySerial.set(printer.serialNumber.toLowerCase(), printer);
      }
      byIp.set(printer.ipAddress, printer);
    }

    const latest = new Map<number, (typeof dailies)[number]>();
    for (const row of dailies) {
      if (!latest.has(row.printerId)) latest.set(row.printerId, row);
    }

    const repairsByAsset = new Map<number, RepairSlice[]>();
    for (const repair of repairs) {
      const list = repairsByAsset.get(repair.printerAssetId) ?? [];
      list.push(repair);
      repairsByAsset.set(repair.printerAssetId, list);
    }

    return assets.map((asset) => {
      const printer = asset.serialNumber
        ? (bySerial.get(asset.serialNumber.toLowerCase()) ?? null)
        : asset.ipAddress
          ? (byIp.get(asset.ipAddress) ?? null)
          : null;

      const daily = printer ? (latest.get(printer.id) ?? null) : null;

      return {
        ...this.toResponse(asset),
        repairs: this.countRepairs(asset, repairsByAsset.get(asset.id) ?? []),
        printer: printer
          ? {
              id: printer.id,
              ipAddress: printer.ipAddress,
              hostName: printer.hostName,
              model: printer.model,
              serialNumber: printer.serialNumber,
              macAddress: printer.macAddress,
              pageCount: printer.pageCount,
              reachable: printer.reachable,
              lastError: printer.lastError,
              lastPolledAt: printer.lastPolledAt,
              lastSuccessAt: printer.lastSuccessAt,
              consoleText: printer.consoleText,
              readings: printer.readings.map((r) => ({
                id: r.id,
                supplyIndex: r.supplyIndex,
                name: r.name,
                supplyType: r.supplyType,
                supplyClass: r.supplyClass,
                colorant: r.colorant,
                level: r.level,
                maxCapacity: r.maxCapacity,
                percent: r.percent,
              })),
              alerts: printer.alerts.map((a) => ({
                id: a.id,
                alertIndex: a.alertIndex,
                severity: a.severity,
                alertGroup: a.alertGroup,
                groupIndex: a.groupIndex,
                code: a.code,
                description: a.description,
              })),
            }
          : null,
        latest: daily
          ? {
              date: fromDate(daily.date),
              pages: daily.pages,
              monoPages: daily.monoPages,
              colorPages: daily.colorPages,
              total: daily.total,
              totalMono: daily.totalMono,
              totalColor: daily.totalColor,
            }
          : null,
      };
    });
  }

  async findOne(id: number) {
    const asset = await this.prisma.printerAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`ID ${id} の端末情報は登録されていません`);
    }
    return this.toResponse(asset);
  }

  async update(id: number, dto: CreatePrinterAssetDto) {
    await this.findOne(id);

    const saved = await this.prisma.printerAsset.update({
      where: { id },
      data: this.toData(dto),
    });
    return this.toResponse(saved);
  }

  /**
   * 中身は変えず、更新日だけを現在時刻に進める。
   * 一覧の「更新」ボタン用。実機を見に行って台帳が正しいことを確かめた、
   * という記録をこの日時で残す。
   */
  async touch(id: number) {
    await this.findOne(id);

    const saved = await this.prisma.printerAsset.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
    return this.toResponse(saved);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.printerAsset.delete({ where: { id } });
    return { id };
  }

  // ── 内部ヘルパー ──────────────────────

  /**
   * 台帳 1 台ぶんの修理の数え方。
   *
   * 回数は**復旧日が保守期間に入っているものだけ**を数える。保守で見てもらった
   * ぶんと自分で直したぶんを、契約の期間で突き合わせられるようにするため。
   * 保守期間が入っていない台帳は「保守内」を決められないので hasMaint を false にして、
   * 画面ではハイフンを出す（0 回と区別する）。
   *
   * 対応中（open）は期間に関わらず数える。今その機器が使えるかどうかの話で、
   * 契約とは別だから。状態が空のものも「完了していない」として数える
   */
  private countRepairs(
    asset: Pick<AssetRow, 'maintStartOn' | 'maintEndOn'>,
    repairs: RepairSlice[],
  ) {
    const inWindow = repairs.filter((repair) =>
      withinMaint(repair.restoredOn, asset.maintStartOn, asset.maintEndOn),
    );

    return {
      hasMaint: asset.maintStartOn !== null || asset.maintEndOn !== null,
      inHouse: inWindow.filter((r) => r.handledBy === 'IN_HOUSE').length,
      vendor: inWindow.filter((r) => r.handledBy === 'VENDOR').length,
      open: repairs.filter((r) => !r.status || r.status !== 'DONE').length,
      total: repairs.length,
    };
  }

  private toData(dto: CreatePrinterAssetDto) {
    return {
      department: toText(dto.department),
      no: toText(dto.no),
      ipAddress: toText(dto.ipAddress),
      maker: toText(dto.maker),
      model: toText(dto.model),
      serialNumber: toText(dto.serialNumber),
      purchasedOn: toDate(dto.purchasedOn),
      contractNo: toText(dto.contractNo),
      maintContract: toText(dto.maintContract),
      maintStartOn: toDate(dto.maintStartOn),
      maintEndOn: toDate(dto.maintEndOn),
      maintDealOn: toDate(dto.maintDealOn),
      maintFee: dto.maintFee ?? null,
      note: toText(dto.note),
      countLayout: dto.countLayout ?? 'TOTAL',
    };
  }

  private toResponse(asset: AssetRow) {
    return {
      id: asset.id,
      department: asset.department,
      no: asset.no,
      ipAddress: asset.ipAddress,
      maker: asset.maker,
      model: asset.model,
      serialNumber: asset.serialNumber,
      purchasedOn: fromDate(asset.purchasedOn),
      contractNo: asset.contractNo,
      maintContract: asset.maintContract,
      maintStartOn: fromDate(asset.maintStartOn),
      maintEndOn: fromDate(asset.maintEndOn),
      maintDealOn: fromDate(asset.maintDealOn),
      maintFee: asset.maintFee,
      note: asset.note,
      countLayout: asset.countLayout,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }
}
