import { CreateMaintVendorDto } from './dto/create-maint-vendor.dto';
import { MaintVendorsService } from './maint-vendors.service';
export declare class MaintVendorsController {
    private readonly service;
    constructor(service: MaintVendorsService);
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
}
