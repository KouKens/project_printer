import type { KeyboardEvent } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { EntryResult, Mode, StockRow } from '../api'
import { fetchStock, submitEntry } from '../api'

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
  optionalTag?: string
}

const MODES: { value: Mode; label: string; note: string; submit: string }[] = [
  {
    value: 'REGISTER',
    label: '登録',
    note: '新しいトナーの品番をマスタに追加します。在庫は 0 から始まります。',
    submit: 'マスタに登録する',
  },
  {
    value: 'RECEIVE',
    label: '搬入',
    note: '納品されたトナーを在庫に加えます。未登録の品番は受け付けません。',
    submit: '在庫に加える',
  },
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

function fieldsFor(mode: Mode): FieldDef[] {
  const fields: FieldDef[] = [
    {
      key: 'userId',
      no: '01',
      label: 'ユーザーID',
      hint: '職員証のバーコードを読み取るか、キーボードで入力します',
      required: 'ユーザーIDを読み取ってください',
    },
    {
      key: 'tonerId',
      no: '02',
      label: 'トナーID',
      hint: 'トナー箱のラベルを読み取るか、キーボードで入力します',
      required: 'トナーIDを読み取ってください',
    },
  ]

  if (mode === 'REGISTER') {
    fields.push({
      key: 'name',
      no: '03',
      label: '名称',
      hint: '空欄のままでも登録できます',
      optionalTag: '任意',
    })
  }

  if (mode === 'ISSUE' || mode === 'DISPOSE') {
    fields.push({
      key: 'quantity',
      no: '03',
      label: '本数',
      hint:
        mode === 'ISSUE'
          ? '持ち出す本数を入力します。既定は 1 本です'
          : '廃棄する本数を入力します。既定は 1 本です',
      required: '本数を入力してください',
      numeric: true,
    })
  }

  return fields
}

function noticeFor(result: EntryResult): string {
  switch (result.action) {
    case 'REGISTER':
      return `${result.tonerId} をマスタに登録しました`
    case 'RECEIVE':
      return `${result.tonerId} を ${result.quantity} 本 搬入しました（在庫 ${result.stock}）`
    case 'ISSUE':
      return `${result.tonerId} を ${result.quantity} 本 持ち出しました（残 ${result.stock}）`
    case 'DISPOSE':
      return `${result.tonerId} を ${result.quantity} 本 廃棄しました（廃棄累計 ${result.disposed} / 搬入 ${result.received}）`
  }
}

export default function ReceptionScreen() {
  const [mode, setMode] = useState<Mode>('ISSUE')
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [activeIndex, setActiveIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [stocks, setStocks] = useState<StockRow[]>([])

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
    try {
      setStocks(await fetchStock())
    } catch {
      // 在庫表示は補助情報。取得に失敗しても受付操作は続けられる
    }
  }, [])

  useEffect(() => {
    void loadStock()
  }, [loadStock])

  const handleChange = (key: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setFailure(null)
  }

  const changeMode = (next: Mode) => {
    if (next === mode) return
    setMode(next)
    setErrors({})
    setFailure(null)
    setNotice(null)
    setValues((prev) => ({ ...prev, name: '', quantity: '1' }))
    setActiveIndex(0)
    window.setTimeout(() => focusField(0), 0)
  }

  const submit = useCallback(async () => {
    if (submitting) return

    const trimmed: FormValues = {
      userId: values.userId.trim(),
      tonerId: values.tonerId.trim(),
      name: values.name.trim(),
      quantity: values.quantity.trim(),
    }

    const nextErrors: FormErrors = {}
    fields.forEach((field) => {
      const value = trimmed[field.key]
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
      tonerId: trimmed.tonerId,
    }
    if (mode === 'REGISTER' && trimmed.name) payload.name = trimmed.name
    if (mode === 'ISSUE' || mode === 'DISPOSE') {
      payload.quantity = Number(trimmed.quantity)
    }

    setSubmitting(true)
    setFailure(null)
    setNotice(null)

    try {
      const result = await submitEntry(payload)
      setValues(EMPTY)
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
  }, [fields, focusField, loadStock, mode, submitting, values])

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
      if (field.required && !values[field.key].trim()) {
        setErrors((prev) => ({ ...prev, [field.key]: field.required }))
        return
      }
      setActiveIndex(index + 1)
      focusField(index + 1)
      return
    }
    void submit()
  }

  const clearAll = () => {
    setValues(EMPTY)
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
                    inputMode={field.numeric ? 'numeric' : 'text'}
                    max={field.numeric ? 999 : undefined}
                    min={field.numeric ? 1 : undefined}
                    onChange={(e) => handleChange(field.key, e.target.value)}
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

        <div className="slip__actions">
          <button
            className="btn btn--primary"
            disabled={submitting}
            onClick={() => void submit()}
            type="button"
          >
            {submitting ? '処理中…' : modeInfo.submit}
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
