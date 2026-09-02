import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerPriceDto } from './dto/create-toner-price.dto';
import { CreateTonerDto } from './dto/create-toner.dto';
import { UpdateTonerDto } from './dto/update-toner.dto';
export declare class TonersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTonerDto): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        recycled: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
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
    findAll(): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        recycled: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
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
        recycled: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
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
    update(id: string, dto: UpdateTonerDto): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        recycled: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
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
        recycled: boolean;
        alertThreshold: number | null;
        yieldPages: number | null;
        price: number | null;
        costPerPage: number | null;
        priceFrom: string | null;
        priceCount: number;
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
    }>;
    findPrices(id: string): Promise<{
        id: number;
        price: number;
        effectiveFrom: string;
        note: string | null;
        createdAt: Date;
    }[]>;
    priceAt(id: string, date: string): Promise<number | null>;
    private assertAssetsExist;
    private currentPrice;
    private toResponse;
}
