import type { KeyboardEvent } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { OrderRow, TonerCatalogRow } from '../api'
import TonerPickerRow from '../components/TonerPickerRow'
import {
  fetchPendingOrders,
  fetchToners,
  submitBulkEntry,
  submitBulkOrder,
  submitEntry,
  submitOrder,
  toLocalInputValue,
} from '../api'
import {
  STAFF_ID_HINT_GUEST,
  filterStaffId,
  staffIdError,
  staffIdToSend,
} from '../lib/staffId'
import { useCompany } from '../lib/company'

/** この画面で扱う操作。発注の記録と、届いたものを在庫に加える搬入 */
type OrderMode = 'ORDER' | 'RECEIVE'

const MODES: {
  value: OrderMode
  label: string
  note: string
  submit: string
}[] = [
  {
    value: 'ORDER',
    label: '注文',
    note: '発注した内容を記録します。在庫は動きません。次回搬入日を入れておくと、届いた本数と突き合わせられます。',
    submit: '注文を記録する',
  },
  {
    value: 'RECEIVE',
    label: '搬入',
    note: '納品されたトナーを在庫に加えます。未登録の品番は受け付けません。下の未入荷の注文から選ぶと入力が埋まります。',
    submit: '在庫に加える',
  },
]

type FieldKey =
  | 'orderedAt'
  | 'userId'
  | 'tonerId'
  | 'quantity'
  | 'deliveryOn'
  | 'receivedOn'

type FormValues = Record<FieldKey, string>
type FormErrors = Partial<Record<FieldKey, string>>

type FieldDef = {
  key: FieldKey
  no: string
  label: string
  hint: string
  type: 'datetime-local' | 'text' | 'number' | 'date'
  optional?: boolean
  /** 名前の行。数字だけを通し、未入力はゲストとして記録する */
  staffId?: boolean
  /** トナーを選ぶ行。入力欄ではなく専用の部品を描く */
  picker?: boolean
}

/** まとめ処理の明細 1 行 */
type Line = { tonerId: string; name: string; quantity: string }

/** 今日を YYYY-MM-DD で。<input type="date"> にそのまま入る形 */
function todayValue(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function fieldsFor(mode: OrderMode): FieldDef[] {
  if (mode === 'RECEIVE') {
    return [
      {
        key: 'userId',
        no: '01',
        label: '名前',
        hint: `搬入を受けた人の名前です。${STAFF_ID_HINT_GUEST}`,
        type: 'text',
        optional: true,
        staffId: true,
      },
      {
        key: 'tonerId',
        no: '02',
        label: 'トナー',
        hint: '',
        type: 'text',
        picker: true,
      },
      {
        key: 'quantity',
        no: '03',
        label: '本数',
        hint: '納品された本数を入力します。既定は 1 本です',
        type: 'number',
      },
      {
        key: 'receivedOn',
        no: '04',
        label: '搬入日',
        hint: '納品された日です。今日の日付が入っています',
        type: 'date',
      },
    ]
  }

  return [
    {
      key: 'orderedAt',
      no: '01',
      label: '注文日時',
      hint: '現在時刻が入っています。過去の注文を入力するときは書き換えてください',
      type: 'datetime-local',
    },
    {
      key: 'userId',
      no: '02',
      label: '名前',
      hint: `注文した人の名前です。${STAFF_ID_HINT_GUEST}`,
      type: 'text',
      optional: true,
      staffId: true,
    },
    {
      key: 'tonerId',
      no: '03',
      label: 'トナー',
      hint: '',
      type: 'text',
      picker: true,
    },
    {
      key: 'quantity',
      no: '04',
      label: '本数',
      hint: '注文した本数を入力します',
      type: 'number',
    },
    {
      key: 'deliveryOn',
      no: '05',
      label: '次回搬入日',
      hint: '納品予定の日です。入れておくと搬入の実績と本数を突き合わせられます',
      type: 'date',
      optional: true,
    },
  ]
}

function emptyValues(): FormValues {
  return {
    orderedAt: toLocalInputValue(),
    userId: '',
    tonerId: '',
    quantity: '1',
    deliveryOn: '',
    receivedOn: todayValue(),
  }
}

const listFormat = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export default function OrderScreen() {
  // 注文も搬入も、右上で選んでいる会社の分だけを扱う
  const { companyId } = useCompany()
  const [mode, setMode] = useState<OrderMode>('ORDER')
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [activeIndex, setActiveIndex] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [catalog, setCatalog] = useState<TonerCatalogRow[]>([])
  /** トナーを探す欄の入力。品番そのものは values.tonerId に入る */
  const [search, setSearch] = useState('')
  /** まとめて処理するか。読み取りの Enter の行き先が変わる */
  const [batch, setBatch] = useState(false)
  const [lines, setLines] = useState<Line[]>([])

  const fields = fieldsFor(mode)
  const modeInfo = MODES.find((m) => m.value === mode)!
  /** トナーの欄の位置。名前の欄が入って区分ごとにずれるので毎回引く */
  const tonerIndex = fields.findIndex((f) => f.picker)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const [rail, setRail] = useState({ top: 0, height: 0 })

  useLayoutEffect(() => {
    const row = rowRefs.current[activeIndex]
    if (!row) return
    setRail({ top: row.offsetTop, height: row.offsetHeight })
  }, [activeIndex, mode])

  const focusField = useCallback((index: number) => {
    const input = inputRefs.current[index]
    if (!input) return
    input.focus()
    input.select()
  }, [])

  const loadOrders = useCallback(async () => {
    try {
      setOrders(companyId === null ? [] : await fetchPendingOrders(companyId))
    } catch {
      // 一覧は補助情報。取得に失敗しても入力は続けられる
    }
  }, [companyId])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  useEffect(() => {
    // 検索は補助機能。取れなくてもバーコードの読み取りは続けられる
    fetchToners()
      .then(setCatalog)
      .catch(() => undefined)
  }, [])

  // 注文は日時が埋まっているのでトナーIDから、搬入はユーザーIDから始める。
  // 区分を変えた直後は入力欄が入れ替わるので、描画後にここで当てる
  useEffect(() => {
    focusField(mode === 'ORDER' ? 1 : 0)
  }, [focusField, mode])

  const changeMode = (next: OrderMode) => {
    if (next === mode) return
    setMode(next)
    setActiveIndex(next === 'ORDER' ? 1 : 0)
    setErrors({})
    setFailure(null)
    setNotice(null)
    setValues((prev) => ({ ...prev, quantity: '1' }))
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setFailure(null)
  }

  const pickToner = (row: TonerCatalogRow) => {
    setValues((prev) => ({ ...prev, tonerId: row.id }))
    setErrors((prev) => ({ ...prev, tonerId: undefined }))
    setFailure(null)
    setSearch(row.name ? `${row.id} ${row.name}` : row.id)
  }

  const handleChange = (key: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setFailure(null)
  }

  /**
   * 明細に足す。トナーと本数だけを見る
   * （注文日時・ユーザーID・日付はまとめ全体で 1 つなので、送信時に確かめる）。
   * 続けて読み取れるよう、トナーの欄に戻す
   */
  const addLine = useCallback((): boolean => {
    const tonerId = values.tonerId.trim()
    if (!tonerId) {
      setErrors((prev) => ({ ...prev, tonerId: 'トナーを選んでください' }))
      return false
    }

    const quantity = values.quantity.trim()
    const parsed = Number(quantity)
    if (!Number.isInteger(parsed) || parsed < 1) {
      setErrors((prev) => ({
        ...prev,
        quantity: '本数は 1 以上の整数で入力してください',
      }))
      return false
    }

    const name = catalog.find((row) => row.id === tonerId)?.name ?? ''
    setLines((prev) => [...prev, { tonerId, name, quantity: quantity || '1' }])
    setValues((prev) => ({ ...prev, tonerId: '', quantity: '1' }))
    setSearch('')
    setErrors({})
    setFailure(null)

    setActiveIndex(tonerIndex)
    focusField(tonerIndex)
    return true
  }, [catalog, focusField, tonerIndex, values])

  const removeLine = (index: number) =>
    setLines((prev) => prev.filter((_, i) => i !== index))

  const submit = useCallback(async () => {
    if (submitting) return

    const trimmed: FormValues = {
      orderedAt: values.orderedAt.trim(),
      userId: values.userId.trim(),
      tonerId: values.tonerId.trim(),
      quantity: values.quantity.trim(),
      deliveryOn: values.deliveryOn.trim(),
      receivedOn: values.receivedOn.trim(),
    }

    const nextErrors: FormErrors = {}

    // 注文・搬入とも名前は任意。入れるなら数字 6〜10 桁、空欄はゲストとして記録する
    const userIdError = staffIdError(trimmed.userId, true)
    if (userIdError) nextErrors.userId = userIdError

    if (mode === 'ORDER') {
      if (!trimmed.orderedAt) {
        nextErrors.orderedAt = '注文日時を入力してください'
      } else if (Number.isNaN(new Date(trimmed.orderedAt).getTime())) {
        nextErrors.orderedAt = '注文日時の形式が正しくありません'
      }
    } else if (!trimmed.receivedOn) {
      nextErrors.receivedOn = '搬入日を入力してください'
    }

    if (!trimmed.tonerId) {
      nextErrors.tonerId = 'トナーを選んでください'
    }

    const count = Number(trimmed.quantity)
    if (!trimmed.quantity) {
      nextErrors.quantity = '本数を入力してください'
    } else if (!Number.isInteger(count) || count < 1) {
      nextErrors.quantity = '本数は 1 以上の整数で入力してください'
    }

    // まとめ処理のときは品番と本数を明細で持つので、入力欄の分は必須にしない
    if (batch) {
      delete nextErrors.tonerId
      delete nextErrors.quantity
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const first = fields.findIndex((f) => nextErrors[f.key])
      setActiveIndex(first)
      focusField(first)
      return
    }

    // まとめ処理：明細に、入力途中の行があればそれも足して送る
    if (batch) {
      const items = [...lines]
      if (trimmed.tonerId) {
        items.push({
          tonerId: trimmed.tonerId,
          name: catalog.find((row) => row.id === trimmed.tonerId)?.name ?? '',
          quantity: trimmed.quantity || '1',
        })
      }

      if (items.length === 0) {
        setFailure('明細がありません。トナーを読み取って「明細に追加」してください')
        return
      }

      setSubmitting(true)
      setFailure(null)
      setNotice(null)

      try {
        const bottles = items.reduce((sum, item) => sum + Number(item.quantity), 0)

        if (mode === 'ORDER') {
          await submitBulkOrder({
            orderedAt: new Date(trimmed.orderedAt).toISOString(),
            userId: staffIdToSend(trimmed.userId),
            companyId,
            ...(trimmed.deliveryOn ? { deliveryOn: trimmed.deliveryOn } : {}),
            items: items.map((item) => ({
              tonerId: item.tonerId,
              quantity: Number(item.quantity),
            })),
          })
          setNotice(
            `${items.length} 件・合計 ${bottles} 本を注文しました` +
              (trimmed.deliveryOn ? `（次回搬入日 ${trimmed.deliveryOn}）` : ''),
          )
        } else {
          await submitBulkEntry({
            action: 'RECEIVE',
            userId: staffIdToSend(trimmed.userId),
            companyId,
            receivedOn: trimmed.receivedOn,
            items: items.map((item) => ({
              tonerId: item.tonerId,
              quantity: Number(item.quantity),
            })),
          })
          setNotice(
            `${items.length} 件・合計 ${bottles} 本を搬入しました（${trimmed.receivedOn}）`,
          )
        }

        setLines([])
        setValues((prev) => ({
          ...emptyValues(),
          userId: prev.userId,
          orderedAt: prev.orderedAt,
          deliveryOn: prev.deliveryOn,
          receivedOn: prev.receivedOn,
        }))
        setSearch('')
        setErrors({})
        setActiveIndex(tonerIndex)
        focusField(tonerIndex)
        void loadOrders()
      } catch (error) {
        setFailure(
          error instanceof Error ? error.message : 'まとめて処理できませんでした',
        )
      } finally {
        setSubmitting(false)
      }
      return
    }

    setSubmitting(true)
    setFailure(null)
    setNotice(null)

    try {
      if (mode === 'ORDER') {
        const result = await submitOrder({
          // datetime-local はローカル時刻なので、UTC に直して送る
          orderedAt: new Date(trimmed.orderedAt).toISOString(),
          userId: staffIdToSend(trimmed.userId),
          companyId,
          tonerId: trimmed.tonerId,
          quantity: count,
          // 未定なら送らない。突き合わせでは「日付なし」の行にまとまる
          ...(trimmed.deliveryOn ? { deliveryOn: trimmed.deliveryOn } : {}),
        })

        setNotice(
          `${result.tonerId} を ${result.quantity} 本 注文しました` +
            (result.deliveryOn ? `（次回搬入日 ${result.deliveryOn}）` : ''),
        )
      } else {
        const result = await submitEntry({
          action: 'RECEIVE',
          userId: staffIdToSend(trimmed.userId),
          companyId,
          tonerId: trimmed.tonerId,
          quantity: count,
          receivedOn: trimmed.receivedOn,
        })

        setNotice(
          `${result.tonerId} を ${result.quantity} 本 搬入しました` +
            `（${trimmed.receivedOn} / 在庫 ${result.stock}）`,
        )
      }

      // 名前は続けて受け付けるので残す。搬入日も同じ日の続きを想定して残す
      setValues((prev) => ({
        ...emptyValues(),
        userId: prev.userId,
        receivedOn: prev.receivedOn,
      }))
      setSearch('')
      setErrors({})
      setActiveIndex(tonerIndex)
      focusField(tonerIndex)
      void loadOrders()
    } catch (error) {
      setFailure(
        error instanceof Error
          ? error.message
          : mode === 'ORDER'
            ? '注文できませんでした'
            : '搬入できませんでした',
      )
    } finally {
      setSubmitting(false)
    }
  }, [
    batch,
    catalog,
    fields,
    focusField,
    lines,
    loadOrders,
    mode,
    submitting,
    tonerIndex,
    values,
  ])

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

    // まとめ処理では本数まで入れたら明細へ。日付や注文日時はまとめ全体で 1 つなので、
    // 1 件ごとに触らせない
    if (batch && fields[index]?.key === 'quantity') {
      addLine()
      return
    }

    if (index < fields.length - 1) {
      setActiveIndex(index + 1)
      focusField(index + 1)
      return
    }
    if (batch) {
      addLine()
      return
    }
    void submit()
  }

  const clearAll = () => {
    setValues(emptyValues())
    setSearch('')
    setLines([])
    setErrors({})
    setNotice(null)
    setFailure(null)
    const start = mode === 'ORDER' ? 1 : 0
    setActiveIndex(start)
    focusField(start)
  }

  /** 未入荷の注文から搬入の入力を埋める。品番・本数・搬入日を写す */
  const pickOrder = (order: OrderRow) => {
    setMode('RECEIVE')
    setValues((prev) => ({
      ...prev,
      tonerId: order.tonerId,
      quantity: String(order.quantity),
      receivedOn: order.deliveryOn ?? todayValue(),
    }))
    setSearch(order.name ? `${order.tonerId} ${order.name}` : order.tonerId)
    setErrors({})
    setFailure(null)
    setNotice(null)
    setActiveIndex(0)
    focusField(0)
  }

  const totalPending = orders.reduce((sum, o) => sum + o.quantity, 0)

  return (
    <>
      <section className="slip" aria-labelledby="order-heading">
        <div className="slip__head">
          <h2 className="slip__heading" id="order-heading">
            注文と搬入
          </h2>

          <div className="mode" role="radiogroup" aria-label="操作の種類">
            {MODES.map((item) => (
              <div className="mode__option" key={item.value}>
                <input
                  checked={mode === item.value}
                  className="mode__input"
                  id={`od-mode-${item.value}`}
                  name="od-mode"
                  onChange={() => changeMode(item.value)}
                  type="radio"
                  value={item.value}
                />
                <label className="mode__label" htmlFor={`od-mode-${item.value}`}>
                  {item.label}
                </label>
              </div>
            ))}
          </div>

          <p className="mode__note">{modeInfo.note}</p>

          <label className="batch__toggle">
            <input
              checked={batch}
              disabled={submitting}
              onChange={(e) => {
                setBatch(e.target.checked)
                setLines([])
                setFailure(null)
              }}
              type="checkbox"
            />
            <span>まとめて{mode === 'ORDER' ? '注文する' : '受け付ける'}</span>
            <span className="batch__note">
              読み取るごとに明細へ積み、最後にまとめて処理します
            </span>
          </label>
        </div>

        <div className="slip__rows">
          <span
            aria-hidden="true"
            className="slip__rail"
            style={{ top: rail.top, height: rail.height }}
          />

          {fields.map((field, index) => {
            const value = values[field.key]
            const error = errors[field.key]
            const filled = value.trim().length > 0
            const numeric = field.type === 'number'

            if (field.picker) {
              return (
                <TonerPickerRow
                  active={activeIndex === index}
                  catalog={catalog}
                  disabled={submitting}
                  error={error}
                  idPrefix="od"
                  inputRef={(el) => {
                    inputRefs.current[index] = el
                  }}
                  key={field.key}
                  no={field.no}
                  onEnter={(e) => handleKeyDown(e, index)}
                  onFocus={() => setActiveIndex(index)}
                  onPick={pickToner}
                  onSearch={handleSearch}
                  rowRef={(el) => {
                    rowRefs.current[index] = el
                  }}
                  search={search}
                  value={value}
                />
              )
            }

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
                    {field.optional ? <span className="row__tag">任意</span> : null}
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
                    inputMode={numeric || field.staffId ? 'numeric' : undefined}
                    max={numeric ? 999 : undefined}
                    maxLength={field.staffId ? 10 : undefined}
                    min={numeric ? 1 : undefined}
                    onChange={(e) =>
                      handleChange(
                        field.key,
                        // 数字以外は打てないようにする。貼り付けもここを通る
                        field.staffId ? filterStaffId(e.target.value) : e.target.value,
                      )
                    }
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

        {batch && (
          <div className="batch">
            <h3 className="batch__heading">
              明細
              <span className="batch__count">{lines.length} 件</span>
              {lines.length > 0 && (
                <span className="batch__count">
                  合計 {lines.reduce((sum, l) => sum + Number(l.quantity || 0), 0)} 本
                </span>
              )}
            </h3>

            {lines.length === 0 ? (
              <p className="batch__empty">
                トナーを読み取って Enter、または「明細に追加」で積みます。
              </p>
            ) : (
              <ul className="batch__list">
                {lines.map((line, index) => (
                  <li className="batch__item" key={`${line.tonerId}-${index}`}>
                    <span className="batch__id">{line.tonerId}</span>
                    <span className="batch__name">{line.name}</span>
                    <span className="batch__qty">{line.quantity} 本</span>
                    <button
                      className="batch__remove"
                      disabled={submitting}
                      onClick={() => removeLine(index)}
                      type="button"
                    >
                      取消
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="slip__actions">
          {batch && (
            <button
              className="btn btn--ghost"
              disabled={submitting}
              onClick={() => addLine()}
              type="button"
            >
              明細に追加
            </button>
          )}
          <button
            className="btn btn--primary"
            disabled={submitting}
            onClick={() => void submit()}
            type="button"
          >
            {submitting
              ? '処理中…'
              : batch
                ? `${modeInfo.submit}（${
                    lines.length + (values.tonerId.trim() ? 1 : 0)
                  } 件）`
                : modeInfo.submit}
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
                <span className="log__name">{order.name ?? ''}</span>
                <span className="log__due">
                  {order.deliveryOn ? `搬入 ${order.deliveryOn}` : ''}
                </span>
                <span className="log__count">{order.quantity}</span>
                <button
                  className="log__pick"
                  disabled={submitting}
                  onClick={() => pickOrder(order)}
                  type="button"
                  title="この注文の品番・本数・搬入日を入力欄に入れます"
                >
                  搬入する
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
