import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintVendorDto } from './dto/create-maint-vendor.dto';
export declare function makerKey(maker: string): string;
export declare class MaintVendorsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateMaintVendorDto): Promise<{
        id: number;
        name: string;
        phones: string[];
        makers: string[];
        note: string | null;
        makerAssetCount: number;
        assets: {
            id: number;
            department: string | null;
            no: string | null;
            maker: string | null;
            model: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        phones: string[];
        makers: string[];
        note: string | null;
        makerAssetCount: number;
        assets: {
            id: number;
            department: string | null;
            no: string | null;
            maker: string | null;
            model: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        phones: string[];
        makers: string[];
        note: string | null;
        makerAssetCount: number;
        assets: {
            id: number;
            department: string | null;
            no: string | null;
            maker: string | null;
            model: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: CreateMaintVendorDto): Promise<{
        id: number;
        name: string;
        phones: string[];
        makers: string[];
        note: string | null;
        makerAssetCount: number;
        assets: {
            id: number;
            department: string | null;
            no: string | null;
            maker: string | null;
            model: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        clearedAssets: number;
    }>;
    private ensureExists;
    private ensureNameFree;
    private makerAssetCounts;
    private ensureMakersFree;
    private toResponse;
}
