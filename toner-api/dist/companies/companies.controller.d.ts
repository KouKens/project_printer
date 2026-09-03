import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
export declare class CompaniesController {
    private readonly service;
    constructor(service: CompaniesService);
    create(dto: CreateCompanyDto): Promise<{
        id: number;
        name: string;
        sortOrder: number;
        note: string | null;
        disabledAt: Date | null;
        counts: {
            assets: number;
            stocks: number;
            entries: number;
            orders: number;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(includeDisabled?: string): Promise<{
        id: number;
        name: string;
        sortOrder: number;
        note: string | null;
        disabledAt: Date | null;
        counts: {
            assets: number;
            stocks: number;
            entries: number;
            orders: number;
        };
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        sortOrder: number;
        note: string | null;
        disabledAt: Date | null;
        counts: {
            assets: number;
            stocks: number;
            entries: number;
            orders: number;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: CreateCompanyDto): Promise<{
        id: number;
        name: string;
        sortOrder: number;
        note: string | null;
        disabledAt: Date | null;
        counts: {
            assets: number;
            stocks: number;
            entries: number;
            orders: number;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    disable(id: number): Promise<{
        id: number;
        name: string;
        sortOrder: number;
        note: string | null;
        disabledAt: Date | null;
        counts: {
            assets: number;
            stocks: number;
            entries: number;
            orders: number;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    enable(id: number): Promise<{
        id: number;
        name: string;
        sortOrder: number;
        note: string | null;
        disabledAt: Date | null;
        counts: {
            assets: number;
            stocks: number;
            entries: number;
            orders: number;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        deleted: boolean;
    }>;
}
