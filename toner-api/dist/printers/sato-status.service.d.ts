export declare const SATO_STATUS_PORT = 9100;
export type SatoStatusKind = 'ok' | 'warn' | 'error';
export declare class SatoUnreachableError extends Error {
}
export type SatoStatusSnapshot = {
    code: string;
    label: string;
    kind: SatoStatusKind;
    nearEnd: boolean;
    jobId: string;
    remaining: number;
    raw: string;
};
export declare function parseSatoStatus(buffer: Buffer): SatoStatusSnapshot;
export declare class SatoStatusService {
    private readonly logger;
    poll(ipAddress: string, port?: number): Promise<SatoStatusSnapshot>;
    private request;
}
