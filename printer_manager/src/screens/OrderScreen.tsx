import type { KeyboardEvent } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { OrderRow, TonerCatalogRow } from '../api'
import BatchLines from '../components/BatchLines'
import CompanyPicker from '../components/CompanyPicker'
import type { PickOrigin } from '../components/TonerPickerRow'
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
import type { BatchLine } from '../lib/batch'
import { addToLines } from '../lib/batch'
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
  /** 前の欄と同じ行の右に並べる（本数｜搬入日）。番号は前の欄と同じにする */
  sameRow?: boolean
}

type Cell = { field: FieldDef; index: number }

/**
 * 画面の行ごとに欄をまとめる。sameRow の欄は前の行に足す。
 * Enter の送り先やエラー時の移動は fields の並びのまま（左 → 右 → 次の行）
 */
function rowsOf(fields: FieldDef[]): Cell[][] {
  const rows: Cell[][] = []
  fields.forEach((field, index) => {
    const last = rows[rows.length - 1]
    if (field.sameRow && last) last.push({ field, index })
    else rows.push([{ field, index }])
  })
  return rows
}

/** 今日を YYYY-MM-DD で。<input type="date"> にそのまま入る形 */
function todayValue(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * 本数と日付はトナーより上に 1 行で置く。トナーの候補一覧が伸びても
 * 押し下げられず、先に決めておいてから読み取れる
 */
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
        key: 'quantity',
        no: '02',
        label: '本数',
        hint: '納品された本数です。既定は 1 本です',
        type: 'number',
      },
      {
        key: 'receivedOn',
        no: '02',
        label: '搬入日',
        hint: '納品された日です。今日の日付が入っています',
        type: 'date',
        sameRow: true,
      },
      {
        key: 'tonerId',
        no: '03',
        label: 'トナー',
        hint: '',
        type: 'text',
        picker: true,
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
      key: 'quantity',
      no: '03',
      label: '本数',
      hint: '注文した本数です',
      type: 'number',
    },
    {
      key: 'deliveryOn',
      no: '03',
      label: '次回搬入日',
      hint: '納品予定の日です。入れておくと搬入の実績と本数を突き合わせられます',
      type: 'date',
      optional: true,
      sameRow: true,
    },
    {
      key: 'tonerId',
      no: '04',
      label: 'トナー',
      hint: '',
      type: 'text',
      picker: true,
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

/**
 * 搬入で注文と本数が合い、注文が入荷済み（自動）になったときの一言。
 * **黙らない** —— 下の「未入荷の注文」から注文が消えた理由が分からなくなる
 */
function receivedOnEntry(count: number): string {
  return count > 0 ? `。注文と本数が一致したので、注文 ${count} 件を入荷済みにしました` : ''
}

/** 先に搬入を受け付けてあり、入れた注文がその場で入荷済みになったときの一言 */
function receivedOnOrder(count: number): string {
  return count > 0
    ? `。同じ日の搬入の記録と本数が一致したので、${count} 件は入荷済みにしました`
    : ''
}

export default function OrderScreen() {
  // 注文も搬入も、見出しの横で選んでいる拠点の分だけを扱う
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
  const [lines, setLines] = useState<BatchLine[]>([])

  const fields = fieldsFor(mode)
  const modeInfo = MODES.find((m) => m.value === mode)!
  /** トナーの欄の位置。名前の欄が入って区分ごとにずれるので毎回引く */
  const tonerIndex = fields.findIndex((f) => f.picker)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  /**
   * トナーの欄で、この Enter が候補の先頭を選んだか。
   * 部品は選んだ直後に同じ打鍵で onEnter を呼ぶが、選んだ品番が values に入るのは
   * 次の描画なので、ここで処理すると前の品番のまま送ってしまう
   */
  const pickedByEnter = useRef(false)
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

  const handleChange = (key: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setFailure(null)
  }

  /**
   * 明細に 1 行足す。本数だけを見る
   * （注文日時・ユーザーID・日付はまとめ全体で 1 つなので、送信時に確かめる）。
   * 同じ品番がもう積んであれば、その行の本数に足す。
   * 続けて読み取れるよう、トナーの欄に戻す。
   * 探す欄の文字は消さない（消すかどうかは呼び出し側が決める）。
   *
   * 品番を引数で受けるのは、候補を押したその場から呼ぶため。
   * setValues の反映を待たないと values.tonerId はまだ前の値になる
   */
  const appendLine = useCallback(
    (tonerId: string, name: string, quantity: string): boolean => {
      const parsed = Number(quantity)
      if (!Number.isInteger(parsed) || parsed < 1) {
        setErrors((prev) => ({
          ...prev,
          quantity: '本数は 1 以上の整数で入力してください',
        }))
        return false
      }

      setLines((prev) => addToLines(prev, { tonerId, name, quantity: String(parsed) }))
      setValues((prev) => ({ ...prev, tonerId: '', quantity: '1' }))
      setErrors({})
      setFailure(null)

      setActiveIndex(tonerIndex)
      focusField(tonerIndex)
      return true
    },
    [focusField, tonerIndex],
  )

  /** 入力欄に入っているトナーを明細へ。「明細に追加」と Enter から呼ぶ */
  const addLine = useCallback((): boolean => {
    const tonerId = values.tonerId.trim()
    if (!tonerId) {
      setErrors((prev) => ({ ...prev, tonerId: 'トナーを選んでください' }))
      return false
    }

    const name = catalog.find((row) => row.id === tonerId)?.name ?? ''
    if (!appendLine(tonerId, name, values.quantity.trim())) return false

    // 欄には選んだ品番（「品番 名称」）が入っているだけなので、次の読み取りに備えて空ける
    setSearch('')
    return true
  }, [appendLine, catalog, values])

  const pickToner = (row: TonerCatalogRow, origin: PickOrigin) => {
    pickedByEnter.current = origin === 'enter'

    // まとめ処理では候補を押した時点で明細へ積む。「明細に追加」を押さずに
    // 次の品番を探せる。本数はその時の入力欄の値（既定 1 本）を使い、
    // 足したあと 1 本に戻す。
    // 探す欄に打った文字は残す。同じ部署・機種の色違いを、候補を出したまま
    // 続けて押せるように（欄は全選択で戻るので、次の読み取りや打鍵はそのまま置き換わる）。
    // 読み取り（auto）と Enter は入力欄に入れるだけにしておく。
    // 本数を直してから積む流れが残っているため
    if (batch && origin === 'click') {
      appendLine(row.id, row.name ?? '', values.quantity.trim())
      return
    }

    setValues((prev) => ({ ...prev, tonerId: row.id }))
    setErrors((prev) => ({ ...prev, tonerId: undefined }))
    setFailure(null)
    setSearch(row.name ? `${row.id} ${row.name}` : row.id)
  }

  const removeLine = (index: number) =>
    setLines((prev) => prev.filter((_, i) => i !== index))

  const setLineQuantity = (index: number, quantity: number) =>
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, quantity: String(quantity) } : line)),
    )

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

    // まとめ処理：明細に、入力途中の行があればそれも足して送る（同じ品番なら本数に足す）
    if (batch) {
      const items = trimmed.tonerId
        ? addToLines(lines, {
            tonerId: trimmed.tonerId,
            name: catalog.find((row) => row.id === trimmed.tonerId)?.name ?? '',
            quantity: trimmed.quantity || '1',
          })
        : lines

      if (items.length === 0) {
        setFailure(
          '明細がありません。トナーを探して候補を押すか、読み取って「明細に追加」してください',
        )
        return
      }

      setSubmitting(true)
      setFailure(null)
      setNotice(null)

      try {
        const bottles = items.reduce((sum, item) => sum + Number(item.quantity), 0)

        if (mode === 'ORDER') {
          const saved = await submitBulkOrder({
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
              (trimmed.deliveryOn ? `（次回搬入日 ${trimmed.deliveryOn}）` : '') +
              receivedOnOrder(saved.filter((order) => order.status === 'RECEIVED').length),
          )
        } else {
          const results = await submitBulkEntry({
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
            `${items.length} 件・合計 ${bottles} 本を搬入しました（${trimmed.receivedOn}）` +
              receivedOnEntry(
                results.reduce((sum, result) => sum + (result.ordersReceived ?? 0), 0),
              ),
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
            (result.deliveryOn ? `（次回搬入日 ${result.deliveryOn}）` : '') +
            receivedOnOrder(result.status === 'RECEIVED' ? 1 : 0),
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
            `（${trimmed.receivedOn} / 在庫 ${result.stock}）` +
            receivedOnEntry(result.ordersReceived ?? 0),
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
    // companyId は送信先そのもの。拠点を切り替えたら必ず取り直す
    // （loadOrders 経由でも入れ替わるが、それに頼ると依存を減らしたとき静かに
    //   前の拠点へ注文・搬入することになる）
  }, [
    batch,
    catalog,
    companyId,
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

    // トナーは最後の欄なので、Enter はそのまま処理になる。候補の先頭を選んだ
    // 打鍵では止め、選ばれた品番を見てからもう一度 Enter で処理する
    // （確かめないまま在庫が動かないように）
    if (pickedByEnter.current) {
      pickedByEnter.current = false
      return
    }

    // まとめ処理では本数からトナーへ飛ぶ。日付や注文日時はまとめ全体で 1 つなので、
    // 1 件ごとに触らせない
    if (batch && fields[index]?.key === 'quantity') {
      setActiveIndex(tonerIndex)
      focusField(tonerIndex)
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
          <div className="slip__top">
            <h2 className="slip__heading" id="order-heading">
              注文と搬入
            </h2>
            <CompanyPicker disabled={submitting} />
          </div>

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
              候補を押すたびに明細へ積み、最後にまとめて処理します
            </span>
          </label>
        </div>

        <div className="slip__rows">
          <span
            aria-hidden="true"
            className="slip__rail"
            style={{ top: rail.top, height: rail.height }}
          />

          {rowsOf(fields).map((cells) => {
            const [{ field: head, index: headIndex }] = cells

            if (head.picker) {
              return (
                <TonerPickerRow
                  active={activeIndex === headIndex}
                  catalog={catalog}
                  disabled={submitting}
                  error={errors[head.key]}
                  idPrefix="od"
                  inputRef={(el) => {
                    inputRefs.current[headIndex] = el
                  }}
                  key={head.key}
                  no={head.no}
                  onEnter={(e) => handleKeyDown(e, headIndex)}
                  onFocus={() => setActiveIndex(headIndex)}
                  onPick={pickToner}
                  onSearch={handleSearch}
                  rowRef={(el) => {
                    rowRefs.current[headIndex] = el
                  }}
                  search={search}
                  value={values[head.key]}
                />
              )
            }

            const isFilled = ({ field }: Cell) => values[field.key].trim().length > 0
            // 並べた行は、任意の欄が空でも他が埋まっていれば済みにする
            const filled =
              cells.some(isFilled) &&
              cells.every((cell) => isFilled(cell) || cell.field.optional)

            // 番号・背景・レールは行で持つ。数値・日時の幅と誤りの下線は欄ごとなので
            // 欄の箱に付ける（CSS はどちらも中の .row__input を見るだけ）
            const bodies = cells.map(({ field, index }) => {
              const error = errors[field.key]
              const numeric = field.type === 'number'

              return (
                <div
                  className={[
                    'row__body',
                    error ? 'row--error' : '',
                    numeric ? 'row--numeric' : '',
                    field.type === 'datetime-local' ? 'row--datetime' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={field.key}
                >
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
                    value={values[field.key]}
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
              )
            })

            return (
              <div
                className={[
                  'row',
                  cells.some((c) => c.index === activeIndex) ? 'row--active' : '',
                  filled ? 'row--filled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={head.key}
                ref={(el) => {
                  // レールはどちらの欄にいても同じ行に止まる
                  cells.forEach((cell) => {
                    rowRefs.current[cell.index] = el
                  })
                }}
              >
                <span aria-hidden="true" className="row__no">
                  {filled ? '✓' : head.no}
                </span>

                {cells.length === 1 ? (
                  bodies
                ) : (
                  <div className="row__pair">{bodies}</div>
                )}
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
          // 注文・搬入は在庫で縛らないので、上限は渡さない
          <BatchLines
            disabled={submitting}
            empty={
              <>
                トナーを探して候補を押すと、上の欄の本数でその場で積まれます。
                読み取ったときは Enter、または「明細に追加」で積みます。
                本数は明細の −／＋ で直せます。
              </>
            }
            lines={lines}
            onQuantity={setLineQuantity}
            onRemove={removeLine}
          />
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
