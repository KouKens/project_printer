"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileOrders = reconcileOrders;
async function reconcileOrders(tx, { companyId, tonerId, date }) {
    if (date === null)
        return { received: 0, reopened: 0 };
    const ordered = await tx.tonerOrder.aggregate({
        where: {
            companyId,
            tonerId,
            deliveryOn: date,
            status: { not: 'CANCELED' },
        },
        _sum: { quantity: true },
    });
    const arrived = await tx.tonerEntry.aggregate({
        where: { companyId, tonerId, receivedOn: date, action: 'RECEIVE' },
        _sum: { quantity: true },
    });
    const orderedCount = ordered._sum.quantity ?? 0;
    const arrivedCount = arrived._sum.quantity ?? 0;
    const key = { companyId, tonerId, deliveryOn: date };
    if (orderedCount > 0 && orderedCount === arrivedCount) {
        const { count } = await tx.tonerOrder.updateMany({
            where: { ...key, status: 'PENDING' },
            data: { status: 'RECEIVED', receiveMode: 'AUTO', receivedAt: new Date() },
        });
        return { received: count, reopened: 0 };
    }
    const { count } = await tx.tonerOrder.updateMany({
        where: { ...key, status: 'RECEIVED', receiveMode: 'AUTO' },
        data: { status: 'PENDING', receiveMode: null, receivedAt: null },
    });
    return { received: 0, reopened: count };
}
//# sourceMappingURL=reconcile.js.map