import type { KeyboardEvent } from 'react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { EntryResult, ReceptionMode, StockRow, TonerCatalogRow } from '../api'
import TonerPickerRow from '../components/TonerPickerRow'
import {
  fetchStock,
  fetchToners,
  submitBulkEntry,
  submitEntry,
} from '../api'
import { STAFF_ID_HINT, filterStaffId, staffIdError } from '../lib/staffId'
import { useCompany } from '../lib/company'

type FieldKey = 'userId' | 'tonerId' | 'name' | 'quantity'

type FormValues = Record<FieldKey, string>
type FormErrors = Partial<Record<FieldKey, string>>

type FieldDef = {
  key: FieldKey
  no: string
  label: string
  hint: string
  required?: string
  numeric?: boolean
  /** 名前の行。数字だけを通し、桁数を確かめる */
  staffId?: boolean
  /** トナーを選ぶ行。入力欄ではなく専用の部品を描く */
  picker?: boolean
  optionalTag?: string
}

const MODES: { value: ReceptionMode; label: string; note: string; submit: string }[] = [
  {
    value: 'ISSUE',
    label: '持ち出し',
    note: '在庫からトナーを引き出します。在庫を超える本数は指定できません。',
    submit: '在庫から引き出す',
  },
  {
    value: 'DISPOSE',
    label: '廃棄',
    note: '使用済みトナーの廃棄を記録します。搬入した累計を超えて廃棄はできません。',
    submit: '廃棄を記録する',
  },
]

const EMPTY: FormValues = { userId: '', tonerId: '', name: '', quantity: '1' }

function fieldsFor(mode: ReceptionMode): FieldDef[] {
  const fields: FieldDef[] = [
    {
      key: 'userId',
      no: '01',
      label: '名前',
      hint:
        mode === 'ISSUE'
          ? `持ち出す人の名前です。${STAFF_ID_HINT}`
          : `廃棄した人の名前です。${STAFF_ID_HINT}`,
      required: '名前を入力してください',
      staffId: true,
    },
    {
      key: 'tonerId',
      no: '02',
      label: 'トナー',
      hint: '',
      required: 'トナーを選んでください',
      picker: true,
    },
  ]

  const hint =
    mode === 'ISSUE'
      ? '持ち出す本数を入力します。既定は 1 本です'
      : '廃棄する本数を入力します。既定は 1 本です'

  fields.push({
    key: 'quantity',
    no: '03',
    label: '本数',
    hint,
    required: '本数を入力してください',
    numeric: true,
  })

  return fields
}

/** まとめ処理の明細 1 行 */
type Line = { tonerId: string; name: string; quantity: string }

/** まとめ処理の結果をひとことで */
function bulkNotice(mode: ReceptionMode, results: EntryResult[]): string {
  const bottles = results.reduce((sum, row) => sum + row.quantity, 0)
  const label = MODES.find((m) => m.value === mode)!.label

  return `${results.length} 件・合計 ${bottles} 本を${label}しました`
}

function noticeFor(result: EntryResult): string {
  switch (result.action) {
    case 'ISSUE':
      return `${result.tonerId} を ${result.quantity} 本 持ち出しました（残 ${result.stock}）`
    case 'DISPOSE':
      return `${result.tonerId} を ${result.quantity} 本 廃棄しました（廃棄累計 ${result.disposed} / 搬入 ${result.received}）`
    default:
      /*
       * 搬入は「注文」の画面へ移したので、この画面からは来ない。
       * ただし API の EntryResult は区分に RECEIVE を持ったままなので、
       * ここで受けないと戻り値が undefined になり得る（本番ビルドが通らない）。
       * 起きないはずの経路だが、黙って空にせず結果は出す
       */
      return `${result.tonerId} を ${result.quantity} 本 受け付けました（残 ${result.stock}）`
  }
}

export default function ReceptionScreen() {
  // 在庫も受付も、右上で選んでいる拠点の分だけを扱う
  const { companyId } = useCompany()
  const [mode, setMode] = useState<ReceptionMode>('ISSUE')
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [activeIndex, setActiveIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [stocks, setStocks] = useState<StockRow[]>([])
  const [catalog, setCatalog] = useState<TonerCatalogRow[]>([])
  /** まとめて受け付けるか。バーコードの Enter の行き先が変わる */
  const [batch, setBatch] = useState(false)
  const [lines, setLines] = useState<Line[]>([])
  /** トナーID を探すための入力。品番そのものは 02 の欄に入る */
  const [search, setSearch] = useState('')

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const [rail, setRail] = useState({ top: 0, height: 0 })

  const fields = fieldsFor(mode)
  const modeInfo = MODES.find((m) => m.value === mode)!

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

  const loadStock = useCallback(async () => {
    // 拠点が決まるまで待つ。拠点を指定しないと API が 400 で断る
    if (companyId === null) return
    try {
      setStocks(await fetchStock(companyId))
    } catch {
      // 在庫表示は補助情報。取得に失敗しても受付操作は続けられる
    }
  }, [companyId])

  useEffect(() => {
    void loadStock()
  }, [loadStock])

  useEffect(() => {
    // 検索は補助機能。取れなくてもバーコードでの受付は続けられる
    fetchToners()
      .then(setCatalog)
      .catch(() => undefined)
  }, [])

  /** 探す欄の入力。品番が決まるのは部品の側 */
  const handleSearch = (value: string) => {
    setSearch(value)
    setFailure(null)
  }

  const pick = (row: TonerCatalogRow) => {
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

  const changeMode = (next: ReceptionMode) => {
    if (next === mode) return
    setMode(next)
    setErrors({})
    setFailure(null)
    setNotice(null)
    setValues((prev) => ({ ...prev, name: '', quantity: '1' }))
    setSearch('')
    // 区分をまたいで明細を持ち越さない。搬入の行を持ち出しで送ってしまうため
    setLines([])
    setActiveIndex(0)
    window.setTimeout(() => focusField(0), 0)
  }

  /**
   * 明細に足す。トナーと本数だけを見る（名前は送信時にまとめて確かめる）。
   * 続けて読み取れるよう、トナーの欄に戻す。
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
    setValues((prev) => ({ ...prev, tonerId: '', name: '', quantity: '1' }))
    setSearch('')
    setErrors({})
    setFailure(null)

    const index = fields.findIndex((f) => f.key === 'tonerId')
    setActiveIndex(index)
    focusField(index)
    return true
  }, [catalog, fields, focusField, values])

  const removeLine = (index: number) =>
    setLines((prev) => prev.filter((_, i) => i !== index))

  const submit = useCallback(async () => {
    if (submitting) return

    const trimmed: FormValues = {
      userId: values.userId.trim(),
      tonerId: values.tonerId.trim(),
      name: values.name.trim(),
      quantity: values.quantity.trim(),
    }

    // まとめ処理：明細に、入力途中の行があればそれも足して送る
    if (batch) {
      const items = [...lines]
      if (trimmed.tonerId) {
        items.push({
          tonerId: trimmed.tonerId,
          name: trimmed.name,
          quantity: trimmed.quantity || '1',
        })
      }

      const userIdError = staffIdError(trimmed.userId, false)
      if (userIdError) {
        setErrors({ userId: userIdError })
        setActiveIndex(0)
        focusField(0)
        return
      }
      if (items.length === 0) {
        setFailure('明細がありません。トナーIDを読み取って「明細に追加」してください')
        return
      }

      setSubmitting(true)
      setFailure(null)
      setNotice(null)

      try {
        const results = await submitBulkEntry({
          action: mode,
          userId: trimmed.userId,
          companyId,
          items: items.map((item) => ({
            tonerId: item.tonerId,
            quantity: Number(item.quantity),
          })),
        })

        setLines([])
        setValues(EMPTY)
        setSearch('')
        setErrors({})
        setNotice(bulkNotice(mode, results))
        setActiveIndex(0)
        focusField(0)
        void loadStock()
      } catch (error) {
        // 1 行でも通らなければ全体が取り消される。明細は残して直せるようにする
        setFailure(
          error instanceof Error
            ? `${error.message}（どれも処理していません）`
            : '処理できませんでした',
        )
      } finally {
        setSubmitting(false)
      }
      return
    }

    const nextErrors: FormErrors = {}
    fields.forEach((field) => {
      const value = trimmed[field.key]
      if (field.staffId) {
        // 持ち出し・廃棄は誰が触ったかを必ず残す。ゲストは通さない
        const message = staffIdError(value, false)
        if (message) nextErrors[field.key] = message
        return
      }
      if (field.required && !value) {
        nextErrors[field.key] = field.required
        return
      }
      if (field.numeric && value) {
        const parsed = Number(value)
        if (!Number.isInteger(parsed) || parsed < 1) {
          nextErrors[field.key] = '本数は 1 以上の整数で入力してください'
        }
      }
    })

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstMissing = fields.findIndex((f) => nextErrors[f.key])
      setActiveIndex(firstMissing)
      focusField(firstMissing)
      return
    }

    const payload: Record<string, unknown> = {
      action: mode,
      userId: trimmed.userId,
      companyId,
      tonerId: trimmed.tonerId,
    }
    payload.quantity = Number(trimmed.quantity)

    setSubmitting(true)
    setFailure(null)
    setNotice(null)

    try {
      const result = await submitEntry(payload)
      setValues(EMPTY)
      setSearch('')
      setErrors({})
      setNotice(noticeFor(result))
      setActiveIndex(0)
      focusField(0)
      void loadStock()
    } catch (error) {
      setFailure(error instanceof Error ? error.message : '処理できませんでした')
    } finally {
      setSubmitting(false)
    }
    // companyId は送信先そのもの。拠点を切り替えたら必ず取り直す
    // （loadStock 経由でも入れ替わるが、それに頼ると依存を減らしたとき静かに
    //   前の拠点の在庫を動かすことになる）
  }, [
    batch,
    companyId,
    fields,
    focusField,
    lines,
    loadStock,
    mode,
    submitting,
    values,
  ])

  useEffect(() => {
    if (!notice) return
    const id = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(id)
  }, [notice])

  // バーコードリーダーは末尾に Enter を送るので、Enter で次の欄へ送る
  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key !== 'Enter') return
    event.preventDefault()

    if (index < fields.length - 1) {
      const field = fields[index]
      const value = values[field.key].trim()
      // 桁が足りないまま次へ送らない。読み取り漏れをその場で気付けるようにする
      const message = field.staffId
        ? staffIdError(value, false)
        : field.required && !value
          ? field.required
          : null
      if (message) {
        setErrors((prev) => ({ ...prev, [field.key]: message }))
        return
      }
      setActiveIndex(index + 1)
      focusField(index + 1)
      return
    }

    // まとめ処理のときは、最後の欄の Enter で送らず明細に積む。
    // バーコードリーダーが Enter を送るので、読み取るだけで行が増える
    if (batch) {
      addLine()
      return
    }
    void submit()
  }

  const clearAll = () => {
    setValues(EMPTY)
    setSearch('')
    setLines([])
    setErrors({})
    setNotice(null)
    setFailure(null)
    setActiveIndex(0)
    focusField(0)
  }

  return (
    <>
      <section className="slip" aria-labelledby="slip-heading">
        <div className="slip__head">
          <h2 className="slip__heading" id="slip-heading">
            トナーを受け付ける
          </h2>

          <div className="mode" role="radiogroup" aria-label="操作の種類">
            {MODES.map((item) => (
              <div className="mode__option" key={item.value}>
                <input
                  checked={mode === item.value}
                  className="mode__input"
                  disabled={submitting}
                  id={`mode-${item.value}`}
                  name="mode"
                  onChange={() => changeMode(item.value)}
                  type="radio"
                  value={item.value}
                />
                <label className="mode__label" htmlFor={`mode-${item.value}`}>
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
            <span>まとめて受け付ける</span>
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

            if (field.picker) {
              return (
                <TonerPickerRow
                  active={activeIndex === index}
                  catalog={catalog}
                  disabled={submitting}
                  error={error}
                  idPrefix="rx"
                  inputRef={(el) => {
                    inputRefs.current[index] = el
                  }}
                  key={field.key}
                  no={field.no}
                  onEnter={(e) => handleKeyDown(e, index)}
                  onFocus={() => setActiveIndex(index)}
                  onPick={pick}
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
                  field.numeric ? 'row--numeric' : '',
                  field.optionalTag ? 'row--optional' : '',
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
                  <label className="row__label" htmlFor={`rx-${field.key}`}>
                    {field.label}
                    {field.optionalTag ? (
                      <span className="row__tag">{field.optionalTag}</span>
                    ) : null}
                  </label>

                  <input
                    aria-describedby={
                      error ? `rx-${field.key}-error` : `rx-${field.key}-hint`
                    }
                    aria-invalid={Boolean(error)}
                    autoComplete="off"
                    autoFocus={index === 0}
                    className="row__input"
                    disabled={submitting}
                    id={`rx-${field.key}`}
                    inputMode={field.numeric || field.staffId ? 'numeric' : 'text'}
                    max={field.numeric ? 999 : undefined}
                    maxLength={field.staffId ? 10 : undefined}
                    min={field.numeric ? 1 : undefined}
                    onChange={(e) =>
                      handleChange(
                        field.key,
                        // 数字以外は打てないようにする。貼り付けもここを通る
                        field.staffId ? filterStaffId(e.target.value) : e.target.value,
                      )
                    }
                    onFocus={() => setActiveIndex(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder="—"
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    spellCheck={false}
                    type={field.numeric ? 'number' : 'text'}
                    value={value}
                  />

                  {error ? (
                    <p className="row__error" id={`rx-${field.key}-error`}>
                      {error}
                    </p>
                  ) : (
                    <p className="row__hint" id={`rx-${field.key}-hint`}>
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
                トナーIDを読み取って Enter、または「明細に追加」で積みます。
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

      <section className="log" aria-labelledby="stock-heading">
        <h2 className="log__heading" id="stock-heading">
          在庫
        </h2>

        {stocks.length === 0 ? (
          <p className="log__empty">
            まだ登録がありません。「登録」で品番を追加すると、ここに並びます。
          </p>
        ) : (
          <ul className="log__list">
            {stocks.map((item) => (
              <li
                className={`log__item${item.quantity === 0 ? ' log__item--empty' : ''}`}
                key={item.id}
              >
                <span className="log__toner">{item.id}</span>
                <span className="log__name">{item.name ?? ''}</span>
                {item.disposed > 0 ? (
                  <span className="log__disposed">廃 {item.disposed}</span>
                ) : null}
                <span className="log__count">{item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
