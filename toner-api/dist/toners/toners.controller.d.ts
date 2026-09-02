import { CreateTonerPriceDto } from './dto/create-toner-price.dto';
import { CreateTonerDto } from './dto/create-toner.dto';
import { UpdateTonerDto } from './dto/update-toner.dto';
import { TonersService } from './toners.service';
export declare class TonersController {
    private readonly service;
    constructor(service: TonersService);
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
    findAll(includeDisabled?: string): Promise<{
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
        recycled: boolean;
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
    disable(id: string): Promise<{
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
    enable(id: string): Promise<{
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
    findPrices(id: string): Promise<{
        id: number;
        price: number;
        effectiveFrom: string;
        note: string | null;
        createdAt: Date;
    }[]>;
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
    priceAt(id: string, date: string): Promise<{
        id: string;
        date: string;
        price: number | null;
    }>;
}
