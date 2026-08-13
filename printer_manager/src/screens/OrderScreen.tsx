import type { KeyboardEvent } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { OrderRow } from '../api'
import { fetchPendingOrders, submitOrder, toLocalInputValue } from '../api'

type FieldKey = 'orderedAt' | 'tonerId' | 'quantity'

type FormValues = Record<FieldKey, string>
type FormErrors = Partial<Record<FieldKey, string>>

const FIELDS: {
  key: FieldKey
  no: string
  label: string
  hint: string
  type: 'datetime-local' | 'text' | 'number'
}[] = [
  {
    key: 'orderedAt',
    no: '01',
    label: '注文日時',
    hint: '現在時刻が入っています。過去の注文を入力するときは書き換えてください',
    type: 'datetime-local',
  },
  {
    key: 'tonerId',
    no: '02',
    label: 'トナーID',
    hint: '登録済みの品番のみ注文できます',
    type: 'text',
  },
  {
    key: 'quantity',
    no: '03',
    label: '本数',
    hint: '注文した本数を入力します',
    type: 'number',
  },
]

function emptyValues(): FormValues {
  return { orderedAt: toLocalInputValue(), tonerId: '', quantity: '1' }
}

const listFormat = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export default function OrderScreen() {
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [activeIndex, setActiveIndex] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const [rail, setRail] = useState({ top: 0, height: 0 })

  useLayoutEffect(() => {
    const row = rowRefs.current[activeIndex]
    if (!row) return
    setRail({ top: row.offsetTop, height: row.offsetHeight })
  }, [activeIndex])

  const focusField = useCallback((index: number) => {
    const input = inputRefs.current[index]
    if (!input) return
    input.focus()
    input.select()
  }, [])

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await fetchPendingOrders())
    } catch {
      // 一覧は補助情報。取得に失敗しても入力は続けられる
    }
  }, [])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  // 注文日時は既定で埋まっているので、トナーIDから始める
  useEffect(() => {
    focusField(1)
  }, [focusField])

  const handleChange = (key: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setFailure(null)
  }

  const submit = useCallback(async () => {
    if (submitting) return

    const trimmed: FormValues = {
      orderedAt: values.orderedAt.trim(),
      tonerId: values.tonerId.trim(),
      quantity: values.quantity.trim(),
    }

    const nextErrors: FormErrors = {}

    if (!trimmed.orderedAt) {
      nextErrors.orderedAt = '注文日時を入力してください'
    } else if (Number.isNaN(new Date(trimmed.orderedAt).getTime())) {
      nextErrors.orderedAt = '注文日時の形式が正しくありません'
    }

    if (!trimmed.tonerId) {
      nextErrors.tonerId = 'トナーIDを入力してください'
    }

    const count = Number(trimmed.quantity)
    if (!trimmed.quantity) {
      nextErrors.quantity = '本数を入力してください'
    } else if (!Number.isInteger(count) || count < 1) {
      nextErrors.quantity = '本数は 1 以上の整数で入力してください'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const first = FIELDS.findIndex((f) => nextErrors[f.key])
      setActiveIndex(first)
      focusField(first)
      return
    }

    setSubmitting(true)
    setFailure(null)
    setNotice(null)

    try {
      const result = await submitOrder({
        // datetime-local はローカル時刻なので、UTC に直して送る
        orderedAt: new Date(trimmed.orderedAt).toISOString(),
        tonerId: trimmed.tonerId,
        quantity: count,
      })

      setValues(emptyValues())
      setErrors({})
      setNotice(`${result.tonerId} を ${result.quantity} 本 注文しました`)
      setActiveIndex(1)
      focusField(1)
      void loadOrders()
    } catch (error) {
      setFailure(error instanceof Error ? error.message : '注文できませんでした')
    } finally {
      setSubmitting(false)
    }
  }, [focusField, loadOrders, submitting, values])

  useEffect(() => {
    if (!notice) return
    const id = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(id)
  }, [notice])

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key !== 'Enter') return
    event.preventDefault()

    if (index < FIELDS.length - 1) {
      setActiveIndex(index + 1)
      focusField(index + 1)
      return
    }
    void submit()
  }

  const clearAll = () => {
    setValues(emptyValues())
    setErrors({})
    setNotice(null)
    setFailure(null)
    setActiveIndex(1)
    focusField(1)
  }

  const totalPending = orders.reduce((sum, o) => sum + o.quantity, 0)

  return (
    <>
      <section className="slip" aria-labelledby="order-heading">
        <div className="slip__head">
          <h2 className="slip__heading" id="order-heading">
            トナーを注文する
          </h2>
          <p className="mode__note">
            発注した内容を記録します。在庫は動きません。届いたら「受付」の搬入で在庫に加えてください。
          </p>
        </div>

        <div className="slip__rows">
          <span
            aria-hidden="true"
            className="slip__rail"
            style={{ top: rail.top, height: rail.height }}
          />

          {FIELDS.map((field, index) => {
            const value = values[field.key]
            const error = errors[field.key]
            const filled = value.trim().length > 0
            const numeric = field.type === 'number'

            return (
              <div
                className={[
                  'row',
                  activeIndex === index ? 'row--active' : '',
                  filled ? 'row--filled' : '',
                  error ? 'row--error' : '',
                  numeric ? 'row--numeric' : '',
                  field.type === 'datetime-local' ? 'row--datetime' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={field.key}
                ref={(el) => {
                  rowRefs.current[index] = el
                }}
              >
                <span aria-hidden="true" className="row__no">
                  {filled ? '✓' : field.no}
                </span>

                <div className="row__body">
                  <label className="row__label" htmlFor={`od-${field.key}`}>
                    {field.label}
                  </label>

                  <input
                    aria-describedby={
                      error ? `od-${field.key}-error` : `od-${field.key}-hint`
                    }
                    aria-invalid={Boolean(error)}
                    autoComplete="off"
                    className="row__input"
                    disabled={submitting}
                    id={`od-${field.key}`}
                    inputMode={numeric ? 'numeric' : undefined}
                    max={numeric ? 999 : undefined}
                    min={numeric ? 1 : undefined}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    onFocus={() => setActiveIndex(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    spellCheck={false}
                    type={field.type}
                    value={value}
                  />

                  {error ? (
                    <p className="row__error" id={`od-${field.key}-error`}>
                      {error}
                    </p>
                  ) : (
                    <p className="row__hint" id={`od-${field.key}-hint`}>
                      {field.hint}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {failure ? (
          <p className="slip__failure" role="alert">
            {failure}
          </p>
        ) : null}

        <div className="slip__actions">
          <button
            className="btn btn--primary"
            disabled={submitting}
            onClick={() => void submit()}
            type="button"
          >
            {submitting ? '処理中…' : '注文を記録する'}
          </button>
          <button
            className="btn btn--ghost"
            disabled={submitting}
            onClick={clearAll}
            type="button"
          >
            クリア
          </button>
        </div>

        <p aria-live="polite" className="slip__notice" role="status">
          {notice}
        </p>
      </section>

      <section className="log" aria-labelledby="pending-heading">
        <h2 className="log__heading" id="pending-heading">
          未入荷の注文
          {orders.length > 0 ? (
            <span className="log__total">{totalPending} 本</span>
          ) : null}
        </h2>

        {orders.length === 0 ? (
          <p className="log__empty">未入荷の注文はありません。</p>
        ) : (
          <ul className="log__list">
            {orders.map((order) => (
              <li className="log__item" key={order.id}>
                <time className="log__time">
                  {listFormat.format(new Date(order.orderedAt))}
                </time>
                <span className="log__toner">{order.tonerId}</span>
                <span className="log__name">{order.toner?.name ?? ''}</span>
                <span className="log__count">{order.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
