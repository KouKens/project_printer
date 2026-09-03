import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
export declare class CompaniesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findAll(includeDisabled?: boolean): Promise<{
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
    setDisabled(id: number, disabled: boolean): Promise<{
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
    private readonly counts;
    private ensureExists;
    private ensureNameFree;
    private toResponse;
}
