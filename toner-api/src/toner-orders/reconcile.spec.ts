import { callArg } from '../common/testing';
import type { Tx } from '../prisma/prisma.service';
import { reconcileOrders } from './reconcile';

/** 注文の本数（取消を除く）と搬入の本数を返す tx の差し替え */
function txWith(ordered: number | null, arrived: number | null) {
  const updateMany = jest.fn().mockResolvedValue({ count: 2 });
  const tx = {
    tonerOrder: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: ordered } }),
      updateMany,
    },
    tonerEntry: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: arrived } }),
    },
  };
  return { tx: tx as unknown as Tx, raw: tx, updateMany };
}

const DATE = new Date(Date.UTC(2026, 9, 6));
const KEY = { companyId: 1, tonerId: 'T1', date: DATE };

type UpdateManyArg = {
  where: Record<string, unknown>;
  data: Record<string, unknown>;
};

describe('reconcileOrders', () => {
  it('本数が合えば、その鍵の未入荷の注文を入荷済み（自動）にする', async () => {
    const { tx, updateMany } = txWith(3, 3);

    const result = await reconcileOrders(tx, KEY);

    const call = callArg<UpdateManyArg>(updateMany);
    expect(call.where).toEqual({
      companyId: 1,
      tonerId: 'T1',
      deliveryOn: DATE,
      status: 'PENDING',
    });
    expect(call.data).toMatchObject({
      status: 'RECEIVED',
      receiveMode: 'AUTO',
    });
    expect(result).toEqual({ received: 2, reopened: 0 });
  });

  /** 手動で入荷済みにしたものは人が確かめた結果なので、合わなくなっても戻さない */
  it('合わなければ、自動で入荷済みにしたものだけを未入荷に戻す', async () => {
    const { tx, updateMany } = txWith(3, 2);

    const result = await reconcileOrders(tx, KEY);

    const call = callArg<UpdateManyArg>(updateMany);
    expect(call.where).toMatchObject({
      status: 'RECEIVED',
      receiveMode: 'AUTO',
    });
    expect(call.data).toEqual({
      status: 'PENDING',
      receiveMode: null,
      receivedAt: null,
    });
    expect(result).toEqual({ received: 0, reopened: 2 });
  });

  it('取り消していない注文だけを数える', async () => {
    const { tx, raw } = txWith(1, 1);

    await reconcileOrders(tx, KEY);

    const where = callArg<{ where: Record<string, unknown> }>(
      raw.tonerOrder.aggregate,
    ).where;
    expect(where.status).toEqual({ not: 'CANCELED' });
    const entryWhere = callArg<{ where: Record<string, unknown> }>(
      raw.tonerEntry.aggregate,
    ).where;
    expect(entryWhere).toMatchObject({ action: 'RECEIVE', receivedOn: DATE });
  });

  /** 注文が 0 本（搬入だけ）は「注文なし」で、入荷済みにするものが無い */
  it('注文が無ければ一致とみなさない', async () => {
    const { tx, updateMany } = txWith(null, null);

    await reconcileOrders(tx, KEY);

    expect(callArg<UpdateManyArg>(updateMany).where).toMatchObject({
      status: 'RECEIVED',
    });
  });

  it('次回搬入日の無い注文は突き合わせられないので何もしない', async () => {
    const { tx, raw, updateMany } = txWith(1, 1);

    const result = await reconcileOrders(tx, { ...KEY, date: null });

    expect(raw.tonerOrder.aggregate).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
    expect(result).toEqual({ received: 0, reopened: 0 });
  });
});
