import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerPriceDto } from './dto/create-toner-price.dto';
import { CreateTonerDto } from './dto/create-toner.dto';
import { UpdateTonerDto } from './dto/update-toner.dto';
export declare const VOLUME_DAYS = 90;
export declare function monthlyPagesOf(rows: {
    pages: number | null;
}[]): number | null;
export declare class TonersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTonerDto): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        part: "OTHER" | "TONER" | "DRUM" | "WASTE" | "MAINTENANCE";
        recycled: boolean;
        genuineId: string | null;
        alternativeIds: string[];
        hidden: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
        disabledAt: Date | null;
        stock: number;
        printers: {
            id: number;
            department: string | null;
            no: string | null;
            ipAddress: string | null;
            maker: string | null;
            model: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(includeDisabled?: boolean): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        part: "OTHER" | "TONER" | "DRUM" | "WASTE" | "MAINTENANCE";
        recycled: boolean;
        genuineId: string | null;
        alternativeIds: string[];
        hidden: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
        disabledAt: Date | null;
        stock: number;
        printers: {
            id: number;
            department: string | null;
            no: string | null;
            ipAddress: string | null;
            maker: string | null;
            model: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        part: "OTHER" | "TONER" | "DRUM" | "WASTE" | "MAINTENANCE";
        recycled: boolean;
        genuineId: string | null;
        alternativeIds: string[];
        hidden: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
        disabledAt: Date | null;
        stock: number;
        printers: {
            id: number;
            department: string | null;
            no: string | null;
            ipAddress: string | null;
            maker: string | null;
            model: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    findHiddenIds(): Promise<string[]>;
    findPriceCompare(): Promise<{
        models: {
            key: string;
            label: string;
            assetCount: number;
        }[];
        volumeDays: number;
        assets: {
            id: number;
            no: string | null;
            department: string | null;
            maker: string | null;
            model: string | null;
            companyName: string;
            modelKey: string;
            monthlyPages: number | null;
        }[];
        toners: {
            id: string;
            name: string | null;
            color: string | null;
            part: import("../generated/prisma/enums").SupplyPart;
            recycled: boolean;
            genuineId: string | null;
            hidden: boolean;
            disabledAt: Date | null;
            yieldPages: number | null;
            price: number | null;
            priceFrom: string | null;
            costPerPage: number | null;
            prices: {
                effectiveFrom: string;
                price: number;
                note: string | null;
            }[];
            printers: {
                id: number;
                no: string | null;
                department: string | null;
                maker: string | null;
                model: string | null;
                companyName: string;
            }[];
            modelKeys: string[];
        }[];
    }>;
    update(id: string, dto: UpdateTonerDto): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        part: "OTHER" | "TONER" | "DRUM" | "WASTE" | "MAINTENANCE";
        recycled: boolean;
        genuineId: string | null;
        alternativeIds: string[];
        hidden: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
        disabledAt: Date | null;
        stock: number;
        printers: {
            id: number;
            department: string | null;
            no: string | null;
            ipAddress: string | null;
            maker: string | null;
            model: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    addPrice(id: string, dto: CreateTonerPriceDto): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        part: "OTHER" | "TONER" | "DRUM" | "WASTE" | "MAINTENANCE";
        recycled: boolean;
        genuineId: string | null;
        alternativeIds: string[];
        hidden: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
        disabledAt: Date | null;
        stock: number;
        printers: {
            id: number;
            department: string | null;
            no: string | null;
            ipAddress: string | null;
            maker: string | null;
            model: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    setDisabled(id: string, disabled: boolean): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        part: "OTHER" | "TONER" | "DRUM" | "WASTE" | "MAINTENANCE";
        recycled: boolean;
        genuineId: string | null;
        alternativeIds: string[];
        hidden: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
        disabledAt: Date | null;
        stock: number;
        printers: {
            id: number;
            department: string | null;
            no: string | null;
            ipAddress: string | null;
            maker: string | null;
            model: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
        removed: {
            prices: number;
            printers: number;
            alternatives: number;
        };
    }>;
    findPrices(id: string): Promise<{
        id: number;
        price: number;
        effectiveFrom: string;
        note: string | null;
        createdAt: Date;
    }[]>;
    priceAt(id: string, date: string): Promise<number | null>;
    private resolveGenuine;
    private assertAssetsExist;
    private currentPrice;
    private toResponse;
}
