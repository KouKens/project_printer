import { PrismaService } from '../prisma/prisma.service';
import { PrintersService } from '../printers/printers.service';
import { CreatePrinterAssetDto } from './dto/create-printer-asset.dto';
type TonerPrinter = {
    id: number;
    name: string | null;
    department: string | null;
    no: string | null;
    ipAddress: string | null;
    sameModel: boolean;
};
type ModelToner = {
    id: string;
    name: string | null;
    color: string | null;
    recycled: boolean;
    alertThreshold: number | null;
    price: number | null;
    stock: number;
    assetCount: number;
    printers: TonerPrinter[];
};
export type SerialFill = {
    status: 'filled';
    serialNumber: string;
} | {
    status: 'taken';
    serialNumber: string;
    assetId: number;
    department: string | null;
    no: string | null;
} | null;
export declare class PrinterAssetsService {
    private readonly prisma;
    private readonly printers;
    constructor(prisma: PrismaService, printers: PrintersService);
    create(dto: CreatePrinterAssetDto): Promise<{
        id: number;
        department: string | null;
        no: string | null;
        ipAddress: string | null;
        maker: string | null;
        model: string | null;
        serialNumber: string | null;
        purchasedOn: string | null;
        purchasePrice: number | null;
        contractNo: string | null;
        maintVendorId: number | null;
        maintVendor: {
            id: number;
            name: string;
            phones: string[];
        } | null;
        effectiveVendor: {
            source: "asset";
            id: number;
            name: string;
            phones: string[];
        } | {
            source: "maker";
            id: number;
            name: string;
            phones: string[];
        } | null;
        maintContract: string | null;
        maintStartOn: string | null;
        maintEndOn: string | null;
        maintDealOn: string | null;
        maintFee: number | null;
        note: string | null;
        countLayout: "TOTAL" | "MONO_COLOR" | "COLOR_MONO";
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(includeDisabled?: boolean): Promise<{
        id: number;
        department: string | null;
        no: string | null;
        ipAddress: string | null;
        maker: string | null;
        model: string | null;
        serialNumber: string | null;
        purchasedOn: string | null;
        purchasePrice: number | null;
        contractNo: string | null;
        maintVendorId: number | null;
        maintVendor: {
            id: number;
            name: string;
            phones: string[];
        } | null;
        effectiveVendor: {
            source: "asset";
            id: number;
            name: string;
            phones: string[];
        } | {
            source: "maker";
            id: number;
            name: string;
            phones: string[];
        } | null;
        maintContract: string | null;
        maintStartOn: string | null;
        maintEndOn: string | null;
        maintDealOn: string | null;
        maintFee: number | null;
        note: string | null;
        countLayout: "TOTAL" | "MONO_COLOR" | "COLOR_MONO";
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOverview(): Promise<{
        repairs: {
            hasMaint: boolean;
            inHouse: number;
            vendor: number;
            cost: number;
            costKnown: number;
            open: number;
            total: number;
        };
        printer: {
            id: number;
            ipAddress: string;
            protocol: import("../generated/prisma/enums").PrinterProtocol;
            hostName: string | null;
            model: string | null;
            serialNumber: string | null;
            macAddress: string | null;
            pageCount: number | null;
            counterUnit: number | null;
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
        } | null;
        latest: {
            date: string;
            pages: number | null;
            monoPages: number | null;
            colorPages: number | null;
            total: number;
            totalMono: number | null;
            totalColor: number | null;
            totalPrint: number | null;
            totalCopy: number | null;
            totalScan: number | null;
        } | null;
        id: number;
        department: string | null;
        no: string | null;
        ipAddress: string | null;
        maker: string | null;
        model: string | null;
        serialNumber: string | null;
        purchasedOn: string | null;
        purchasePrice: number | null;
        contractNo: string | null;
        maintVendorId: number | null;
        maintVendor: {
            id: number;
            name: string;
            phones: string[];
        } | null;
        effectiveVendor: {
            source: "asset";
            id: number;
            name: string;
            phones: string[];
        } | {
            source: "maker";
            id: number;
            name: string;
            phones: string[];
        } | null;
        maintContract: string | null;
        maintStartOn: string | null;
        maintEndOn: string | null;
        maintDealOn: string | null;
        maintFee: number | null;
        note: string | null;
        countLayout: "TOTAL" | "MONO_COLOR" | "COLOR_MONO";
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findByModel(): Promise<{
        key: string;
        maker: string | null;
        model: string | null;
        spellings: string[];
        assetCount: number;
        linkedCount: number;
        mixed: boolean;
        colors: string[];
        colorSource: string | null;
        polled: number;
        toners: ModelToner[];
        assets: {
            id: number;
            department: string | null;
            no: string | null;
            ipAddress: string | null;
            maker: string | null;
            model: string | null;
            serialNumber: string | null;
            tonerIds: string[];
        }[];
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        department: string | null;
        no: string | null;
        ipAddress: string | null;
        maker: string | null;
        model: string | null;
        serialNumber: string | null;
        purchasedOn: string | null;
        purchasePrice: number | null;
        contractNo: string | null;
        maintVendorId: number | null;
        maintVendor: {
            id: number;
            name: string;
            phones: string[];
        } | null;
        effectiveVendor: {
            source: "asset";
            id: number;
            name: string;
            phones: string[];
        } | {
            source: "maker";
            id: number;
            name: string;
            phones: string[];
        } | null;
        maintContract: string | null;
        maintStartOn: string | null;
        maintEndOn: string | null;
        maintDealOn: string | null;
        maintFee: number | null;
        note: string | null;
        countLayout: "TOTAL" | "MONO_COLOR" | "COLOR_MONO";
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: CreatePrinterAssetDto): Promise<{
        id: number;
        department: string | null;
        no: string | null;
        ipAddress: string | null;
        maker: string | null;
        model: string | null;
        serialNumber: string | null;
        purchasedOn: string | null;
        purchasePrice: number | null;
        contractNo: string | null;
        maintVendorId: number | null;
        maintVendor: {
            id: number;
            name: string;
            phones: string[];
        } | null;
        effectiveVendor: {
            source: "asset";
            id: number;
            name: string;
            phones: string[];
        } | {
            source: "maker";
            id: number;
            name: string;
            phones: string[];
        } | null;
        maintContract: string | null;
        maintStartOn: string | null;
        maintEndOn: string | null;
        maintDealOn: string | null;
        maintFee: number | null;
        note: string | null;
        countLayout: "TOTAL" | "MONO_COLOR" | "COLOR_MONO";
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    refresh(id: number): Promise<{
        id: number;
        ipAddress: null;
        status: "no-ip";
        message: string;
        printer: null;
        serial: null;
    } | {
        id: number;
        ipAddress: string;
        status: "ok";
        message: null;
        printer: {
            id: number;
            ipAddress: string;
            community: string;
            version: import("../printers/dto/create-printer.dto").SnmpVersionInput;
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
        serial: SerialFill;
    } | {
        id: number;
        ipAddress: string;
        status: "unreachable";
        message: string;
        printer: null;
        serial: null;
    }>;
    touch(id: number): Promise<{
        id: number;
        department: string | null;
        no: string | null;
        ipAddress: string | null;
        maker: string | null;
        model: string | null;
        serialNumber: string | null;
        purchasedOn: string | null;
        purchasePrice: number | null;
        contractNo: string | null;
        maintVendorId: number | null;
        maintVendor: {
            id: number;
            name: string;
            phones: string[];
        } | null;
        effectiveVendor: {
            source: "asset";
            id: number;
            name: string;
            phones: string[];
        } | {
            source: "maker";
            id: number;
            name: string;
            phones: string[];
        } | null;
        maintContract: string | null;
        maintStartOn: string | null;
        maintEndOn: string | null;
        maintDealOn: string | null;
        maintFee: number | null;
        note: string | null;
        countLayout: "TOTAL" | "MONO_COLOR" | "COLOR_MONO";
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setDisabled(id: number, disabled: boolean): Promise<{
        id: number;
        department: string | null;
        no: string | null;
        ipAddress: string | null;
        maker: string | null;
        model: string | null;
        serialNumber: string | null;
        purchasedOn: string | null;
        purchasePrice: number | null;
        contractNo: string | null;
        maintVendorId: number | null;
        maintVendor: {
            id: number;
            name: string;
            phones: string[];
        } | null;
        effectiveVendor: {
            source: "asset";
            id: number;
            name: string;
            phones: string[];
        } | {
            source: "maker";
            id: number;
            name: string;
            phones: string[];
        } | null;
        maintContract: string | null;
        maintStartOn: string | null;
        maintEndOn: string | null;
        maintDealOn: string | null;
        maintFee: number | null;
        note: string | null;
        countLayout: "TOTAL" | "MONO_COLOR" | "COLOR_MONO";
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private fillSerial;
    private ensureExists;
    private countRepairs;
    private toData;
    private vendorsByMaker;
    private effectiveVendor;
    private toResponse;
}
export {};
