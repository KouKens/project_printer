import type { Tx } from '../prisma/prisma.service';

/** 突き合わせの鍵。トナー入出状況の 1 行（拠点 ＋ 品番 ＋ 日付）にあたる */
export type ReconcileKey = {
  companyId: number;
  tonerId: string;
  /** 注文の次回搬入日 = 搬入の搬入日。日付の無い注文は突き合わせられない */
  date: Date | null;
};

/** 決め直した結果。画面の知らせに添える */
export type ReconcileResult = {
  /** 一致したので入荷済み（自動）にした注文の件数 */
  received: number;
  /** 一致しなくなったので未入荷に戻した注文の件数（自動で入荷済みにしていたもの） */
  reopened: number;
};

/**
 * 鍵 1 つぶんの注文を、搬入の記録と突き合わせて入荷済み／未入荷に決め直す。
 *
 * **一致**（取り消していない注文の本数の合計 = 搬入の本数の合計）なら、
 * 未入荷の注文を入荷済み（自動）にする。トナー入出状況の「一致」と同じ判定。
 * **一致しなければ**、自動で入荷済みにしていた注文だけを未入荷に戻す。
 * 手動で入荷済みにしたものは人が確かめた結果なので触らない。
 *
 * 呼ぶのは鍵の本数が変わったとき —— 搬入を受け付けた・取り消した、
 * 注文を入れた・取り消した、手動の入荷済みを戻した。画面を開いたとき（GET）には
 * 呼ばない（読むだけで記録が書き換わると、いつ入荷済みになったのか追えなくなる）。
 * 鍵の本数を変えた操作と同じトランザクションで呼ぶこと。
 *
 * これを入れる前の注文は migration `20261006013109_toner_order_receive` が
 * 同じ判定で入荷済みにしてある
 */
export async function reconcileOrders(
  tx: Tx,
  { companyId, tonerId, date }: ReconcileKey,
): Promise<ReconcileResult> {
  if (date === null) return { received: 0, reopened: 0 };

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
