export declare function toDate(value: string): Date;
export declare function toDate(value: string | null | undefined): Date | null;
export declare function fromDate(value: Date): string;
export declare function fromDate(value: Date | null): string | null;
export declare function startOfDay(date: Date): Date;
export declare function today(): Date;
export declare function parseDateKey(value: string, label: string): Date;
export type Period = {
    since: Date;
    until: Date | null;
    firstDay: Date;
    lastDay: Date | null;
};
export declare function periodOf(days: number, from?: string, to?: string): Period;
export declare function timeRange(period: Period): {
    gte: Date;
    lt?: undefined;
} | {
    gte: Date;
    lt: Date;
};
export declare function dayRange(period: Period): {
    gte: Date;
    lte?: undefined;
} | {
    gte: Date;
    lte: Date;
};
