import type { SnmpVersionInput } from './create-printer.dto';
export declare class ProbePrinterDto {
    ipAddress: string;
    community?: string;
    version?: SnmpVersionInput;
}
