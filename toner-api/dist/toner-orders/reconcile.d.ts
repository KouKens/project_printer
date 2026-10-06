import type { Tx } from '../prisma/prisma.service';
export type ReconcileKey = {
    companyId: number;
    tonerId: string;
    date: Date | null;
};
export type ReconcileResult = {
    received: number;
    reopened: number;
};
export declare function reconcileOrders(tx: Tx, { companyId, tonerId, date }: ReconcileKey): Promise<ReconcileResult>;
