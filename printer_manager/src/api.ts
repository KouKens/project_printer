/**
 * API の基点。画面側と同じものを使う。
 * ここだけ '/api' を直書きしていると VITE_API_BASE を変えたときに食い違う
 */
import { API } from './lib/request'
import { periodQuery } from './lib/period'
import type { Period } from './lib/period'

/**
 * 在庫を動かす操作。
 * マスタへの品番追加（REGISTER）は「トナー登録」の画面に一本化したので、
 * ここには持たない。API 側は互換のため受け付ける
 */
export type Mode = 'RECEIVE' | 'ISSUE' | 'DISPOSE'

/**
 * 受付で扱う操作。**搬入は「注文」の画面に移した**ので、
 * 受付は在庫を減らす 2 つだけを持つ
 */
export type ReceptionMode = Extract<Mode, 'ISSUE' | 'DISPOSE'>

export type StockRow = {
  id: string
  name: string | null
  quantity: number
  received: number
  disposed: number
  updatedAt: string
}

/**
 * トナーマスタの 1 件。受付画面の検索に使う。
 * printers は端末情報の台帳なので、部署や No. で引ける
 */
export type TonerCatalogRow = {
  id: string
  name: string | null
  color: string | null
  /** リサイクル品・互換品か。候補に札を付けて純正と取り違えないようにする */
  recycled: boolean
  stock: number
  printers: {
    id: number
    department: string | null
    no: string | null
    ipAddress: string | null
    model: string | null
  }[]
}

export type EntryResult = {
  tonerId: string
  name: string | null
  action: Mode
  quantity: number
  stock: number
  received: number
  disposed: number
  /** 搬入で本数が一致して、入荷済み（自動）になった注文の件数。搬入のときだけ入る */
  ordersReceived?: number
}

export type OrderRow = {
  id: number
  tonerId: string
  /** どの拠点の注文か。トナー入出状況は全拠点を並べるので列に出す */
  companyId: number
  companyName: string
  /** 注文した人。名前を入れずに注文した分は「ゲスト」。列を足す前の注文は null */
  userId: string | null
  name: string | null
  quantity: number
  orderedAt: string
  /** 次回搬入日（YYYY-MM-DD）。未定なら null */
  deliveryOn: string | null
  status: 'PENDING' | 'RECEIVED' | 'CANCELED'
  /** 入荷済みにした日時。未入荷なら null */
  receivedAt: string | null
  /**
   * 入荷済みにした方法。AUTO = 搬入の記録と本数が一致して自動で、
   * MANUAL = トナー入出状況で手動で。未入荷なら null
   */
  receiveMode: ReceiveMode | null
}

export type ReceiveMode = 'AUTO' | 'MANUAL'

/** 注文の状態の呼び名。入荷済みは自動か手動かまで分ける */
export function orderStatusLabel(order: {
  status: string
  receiveMode: ReceiveMode | null
}): string {
  if (order.status === 'PENDING') return '未入荷'
  if (order.status === 'CANCELED') return '取消'
  return order.receiveMode === 'MANUAL' ? '入荷済み（手動）' : '入荷済み（自動）'
}

export type OrderResult = {
  id: number
  tonerId: string
  name: string | null
  quantity: number
  orderedAt: string
  deliveryOn: string | null
  /** 先に搬入を受け付けてあって本数が合えば、入れた時点で RECEIVED になっている */
  status: string
  receiveMode: ReceiveMode | null
}

/** 受付の履歴 1 件 */
export type EntryRow = {
  id: number
  userId: string
  tonerId: string
  /** どの拠点の受け払いか。無効にした拠点の名前も API が引いて添える */
  companyId: number
  companyName: string
  name: string | null
  color: string | null
  action: 'REGISTER' | 'RECEIVE' | 'ISSUE' | 'DISPOSE' | 'ADJUST'
  quantity: number
  balance: number
  /** 搬入日。搬入以外は null */
  receivedOn: string | null
  createdAt: string
}

/** 注文と搬入の突き合わせ 1 行（拠点 ＋ 品番 ＋ 日付） */
export type DeliveryCheckRow = {
  key: string
  companyId: number
  companyName: string
  tonerId: string
  name: string | null
  color: string | null
  date: string | null
  ordered: number
  received: number
  diff: number
  status: 'match' | 'short' | 'over' | 'no-order' | 'waiting' | 'undated'
  orders: {
    id: number
    quantity: number
    orderedAt: string
    status: string
    receivedAt: string | null
    receiveMode: ReceiveMode | null
  }[]
  entries: { id: number; quantity: number; userId: string; createdAt: string }[]
  /** まだ未入荷の注文。「入荷済みにする」が送る先 */
  pendingOrderIds: number[]
  /**
   * 片付いた行か（注文があり、どれも未入荷でない）。
   * 数が合わないまま手動で入荷済みにした行は「数の合わない行」に数えない
   */
  settled: boolean
}

/** NestJS の ValidationPipe はエラーを配列で返すので、先頭を取り出す */
async function toError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => null)
  const message = Array.isArray(body?.message) ? body.message[0] : body?.message
  return new Error(message ?? fallback)
}

async function post<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw await toError(res, '処理できませんでした')
  return res.json()
}

async function del<T>(path: string, fallback: string): Promise<T> {
  const res = await fetch(path, { method: 'DELETE' })
  if (!res.ok) throw await toError(res, fallback)
  return res.json()
}

async function get<T>(path: string, fallback: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw await toError(res, fallback)
  return res.json()
}

export function submitEntry(payload: Record<string, unknown>) {
  return post<EntryResult>(`${API}/toner-entries`, payload)
}

/**
 * 在庫の一覧。**拠点ごと。**
 * 拠点を渡さないと API が 400 で断る（他の拠点の数を混ぜないため）
 */
export function fetchStock(companyId: number) {
  return get<StockRow[]>(
    `${API}/toner-entries/stock?companyId=${companyId}`,
    '在庫を取得できませんでした',
  )
}

/** 同じ区分の複数行をまとめて送る。1 行でも通らなければ全体が取り消される */
export function submitBulkEntry(payload: Record<string, unknown>) {
  return post<EntryResult[]>(`${API}/toner-entries/bulk`, payload)
}

export function fetchToners() {
  return get<TonerCatalogRow[]>(
    `${API}/toners`,
    'トナーマスタを取得できませんでした',
  )
}

/**
 * 他の画面に出さない品番（トナー登録で「表示」を外したもの。無効も含む）。
 * トナー入出状況が記録を絞るのに使う
 */
export function fetchHiddenTonerIds() {
  return get<string[]>(
    `${API}/toners/hidden`,
    '表示を外した品番を取得できませんでした',
  )
}

export function submitOrder(payload: Record<string, unknown>) {
  return post<OrderResult>(`${API}/toner-orders`, payload)
}

/** 同じ注文日時・次回搬入日でまとめて注文する。1 件でも通らなければ全体が取り消される */
export function submitBulkOrder(payload: Record<string, unknown>) {
  return post<OrderResult[]>(`${API}/toner-orders/bulk`, payload)
}

/** 未入荷の注文。**拠点ごと** */
export function fetchPendingOrders(companyId: number) {
  return get<OrderRow[]>(
    `${API}/toner-orders/pending?companyId=${companyId}`,
    '注文を取得できませんでした',
  )
}

/** 注文履歴（直近 50 件）。拠点を渡さなければ全拠点（トナー入出状況） */
export function fetchOrders(companyId?: number) {
  return get<OrderRow[]>(
    `${API}/toner-orders${companyId ? `?companyId=${companyId}` : ''}`,
    '注文を取得できませんでした',
  )
}

/**
 * 受付の履歴の戻り。
 * **`truncated` が立っていたら上限で切れている。** 並んでいるものが
 * その期間の全部だと読ませないよう、画面に断りを出すために付いている
 */
export type EntryHistory = {
  rows: EntryRow[]
  truncated: boolean
  /** 1 回に返す上限の件数 */
  limit: number
}

/**
 * 受付の履歴。区分で絞れる。期間は受付日時で絞る。
 * `companyId` を渡すとその拠点の分だけ、渡さなければ全拠点（トナー入出状況）
 */
export function fetchEntryHistory(period: Period, action?: string, companyId?: number) {
  const query =
    `${periodQuery(period)}${action ? `&action=${action}` : ''}` +
    `${companyId ? `&companyId=${companyId}` : ''}`
  return get<EntryHistory>(
    `${API}/toner-entries/history?${query}`,
    '受付の履歴を取得できませんでした',
  )
}

/** 受付の記録を取り消す。在庫は操作の逆を当てて戻る */
export function deleteEntry(id: number) {
  return del<{ tonerId: string; action: string; quantity: number; stock: number }>(
    `${API}/toner-entries/${id}`,
    '取り消せませんでした',
  )
}

/** 注文を取り消す */
export function deleteOrder(id: number) {
  return del<{ id: number }>(`${API}/toner-orders/${id}`, '取り消せませんでした')
}

/**
 * 注文を手動で入荷済みにする（トナー入出状況で一致しなかった行用）。
 * 1 件でも未入荷でなければ全体が断られる
 */
export function receiveOrders(ids: number[]) {
  return post<OrderRow[]>(`${API}/toner-orders/receive`, { ids })
}

/**
 * 手動で入荷済みにした注文を未入荷に戻す。自動のものは断られる。
 * 戻したあとで搬入と本数が合っていれば、戻り値は入荷済み（自動）になっている
 */
export function unreceiveOrder(id: number) {
  return post<OrderRow>(`${API}/toner-orders/${id}/unreceive`, {})
}

/**
 * 注文と搬入の突き合わせ。拠点を渡さなければ全拠点（トナー入出状況）。
 * 拠点は突き合わせの鍵に入っているので、全拠点でも別の拠点の搬入は混ざらない。
 * 期間は突き合わせの日付（次回搬入日・搬入日）で絞る
 */
export function fetchDeliveryCheck(period: Period, companyId?: number) {
  return get<DeliveryCheckRow[]>(
    `${API}/toner-orders/delivery-check?${periodQuery(period)}` +
      `${companyId ? `&companyId=${companyId}` : ''}`,
    '突き合わせを取得できませんでした',
  )
}

/** datetime-local の値（ローカル時刻）を作る */
export function toLocalInputValue(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}
