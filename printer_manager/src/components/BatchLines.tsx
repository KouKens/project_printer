import type { ReactNode } from 'react'
import type { BatchLine } from '../lib/batch'
import { MAX_LINE_QUANTITY } from '../lib/batch'

/**
 * まとめ処理の明細の一覧。**持出/廃棄と注文/搬入で同じものを使う。**
 *
 * 本数は行ごとの −／＋ で直す。入力欄に戻って打ち直さなくて済むように。
 * 1 本より減らすボタンは止める（行ごと外すのは「取消」）。
 *
 * 上限が分かる画面（持ち出し＝在庫、廃棄＝搬入累計 − 廃棄累計）は `limitOf` を渡す。
 * ＋ はその本数で止め、超えている行には印を付ける。**最後に決めるのは API**
 * （在庫は読んだ時点の数で、他の人が持ち出していれば変わっている）
 */
type Props = {
  lines: BatchLine[]
  disabled?: boolean
  onQuantity: (index: number, quantity: number) => void
  onRemove: (index: number) => void
  /** その品番を何本まで積めるか。分からなければ null（縛らない） */
  limitOf?: (tonerId: string) => number | null
  /** 上限の呼び名。「在庫」「廃棄できる本数」 */
  limitLabel?: string
  /** 明細が空のときの案内 */
  empty: ReactNode
}

export default function BatchLines({
  lines,
  disabled,
  onQuantity,
  onRemove,
  limitOf,
  limitLabel = '上限',
  empty,
}: Props) {
  const total = lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0)

  return (
    <div className="batch">
      <h3 className="batch__heading">
        明細
        <span className="batch__count">{lines.length} 件</span>
        {lines.length > 0 && <span className="batch__count">合計 {total} 本</span>}
      </h3>

      {lines.length === 0 ? (
        <p className="batch__empty">{empty}</p>
      ) : (
        <ul className="batch__list">
          {lines.map((line, index) => {
            const quantity = Number(line.quantity)
            const limit = limitOf?.(line.tonerId) ?? null
            const over = limit !== null && quantity > limit
            const atLimit = limit !== null && quantity >= limit

            return (
              <li
                className={`batch__item${over ? ' batch__item--over' : ''}`}
                key={line.tonerId}
              >
                <span className="batch__id">{line.tonerId}</span>
                <span className="batch__name">{line.name}</span>
                {over && (
                  <span className="batch__over" role="status">
                    {limitLabel} {limit} 本
                  </span>
                )}
                <span className="batch__stepper">
                  <button
                    aria-label={`${line.tonerId} を 1 本減らす`}
                    className="batch__step"
                    disabled={disabled || quantity <= 1}
                    onClick={() => onQuantity(index, quantity - 1)}
                    title={quantity <= 1 ? '1 本より減らすときは「取消」で行ごと外します' : undefined}
                    type="button"
                  >
                    −
                  </button>
                  <span className="batch__qty" aria-live="polite">
                    {quantity} 本
                  </span>
                  <button
                    aria-label={`${line.tonerId} を 1 本増やす`}
                    className="batch__step"
                    disabled={disabled || atLimit || quantity >= MAX_LINE_QUANTITY}
                    onClick={() => onQuantity(index, quantity + 1)}
                    title={atLimit ? `${limitLabel}は ${limit} 本です` : undefined}
                    type="button"
                  >
                    ＋
                  </button>
                </span>
                <button
                  className="batch__remove"
                  disabled={disabled}
                  onClick={() => onRemove(index)}
                  type="button"
                >
                  取消
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
