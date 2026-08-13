export type Mode = 'REGISTER' | 'RECEIVE' | 'ISSUE' | 'DISPOSE'

export type StockRow = {
  id: string
  name: string | null
  quantity: number
  received: number
  disposed: number
  updatedAt: string
}

export type EntryResult = {
  tonerId: string
  name: string | null
  action: Mode
  quantity: number
  stock: number
  received: number
  disposed: number
}

export type OrderRow = {
  id: number
  tonerId: string
  quantity: number
  orderedAt: string
  status: 'PENDING' | 'RECEIVED' | 'CANCELED'
  toner?: { name: string | null }
}

export type OrderResult = {
  id: number
  tonerId: string
  name: string | null
  quantity: number
  orderedAt: string
  status: string
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

async function get<T>(path: string, fallback: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw await toError(res, fallback)
  return res.json()
}

export function submitEntry(payload: Record<string, unknown>) {
  return post<EntryResult>('/api/toner-entries', payload)
}

export function fetchStock() {
  return get<StockRow[]>('/api/toner-entries/stock', '在庫を取得できませんでした')
}

export function submitOrder(payload: Record<string, unknown>) {
  return post<OrderResult>('/api/toner-orders', payload)
}

export function fetchPendingOrders() {
  return get<OrderRow[]>('/api/toner-orders/pending', '注文を取得できませんでした')
}

/** datetime-local の値（ローカル時刻）を作る */
export function toLocalInputValue(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}
