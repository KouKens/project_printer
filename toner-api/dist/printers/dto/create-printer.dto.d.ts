export type SnmpVersionInput = '1' | '2c';
export declare class CreatePrinterDto {
    ipAddress: string;
    community?: string;
    version?: SnmpVersionInput;
    location?: string;
}
