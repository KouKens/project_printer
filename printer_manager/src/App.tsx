import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import './App.css'
import AssetScreen from './screens/AssetScreen'
import CostScreen from './screens/CostScreen'
import DeliveryScreen from './screens/DeliveryScreen'
import InvoiceCheckScreen from './screens/InvoiceCheckScreen'
import InvoiceScreen from './screens/InvoiceScreen'
import LabelMeterScreen from './screens/LabelMeterScreen'
import MaintVendorScreen from './screens/MaintVendorScreen'
import ModelTonerScreen from './screens/ModelTonerScreen'
import OrderScreen from './screens/OrderScreen'
import PageCountScreen from './screens/PageCountScreen'
import PrinterListScreen from './screens/PrinterListScreen'
import ReceptionScreen from './screens/ReceptionScreen'
import RepairScreen from './screens/RepairScreen'
import StockTakeScreen from './screens/StockTakeScreen'
import TonerScreen from './screens/TonerScreen'
import CompanyScreen from './screens/CompanyScreen'
import { CompanyProvider, useCompanies } from './lib/company'

type View =
  | 'reception'
  | 'order'
  | 'delivery'
  | 'printers'
  | 'pages'
  | 'asset'
  | 'toner'
  | 'models'
  | 'cost'
  | 'stocktake'
  | 'repair'
  | 'vendor'
  | 'invoice'
  | 'invoiceCheck'
  | 'labelMeter'
  | 'company'

/**
 * 画面のまとまり。**入力 → 管理 → 登録 → 調整中**の順に並べる。
 * 入力 = 日々の記録／管理 = 見て確かめるもの／登録 = 先に用意しておくもの（マスタ）。
 *
 * 使う回数の多い順。**左端は既定で開く「受付」に合わせてある**ので、
 * 起動した位置とタブの位置が食い違わない。
 * 登録は月に数回なので、いちばん奥に置く。
 *
 * 調整中 = まだ数字を詰めている画面。出す値が固まっていないので、
 * 日々見るまとまりとは分けていちばん奥に置く。
 *
 * wide = 表を並べる画面。受付・注文は伝票を模した 620px の幅に収めるが、
 * 一覧は列が多く収まらないので窓いっぱいまで使う。
 */
const GROUPS: {
  label: string
  views: { value: View; label: string; wide?: boolean }[]
}[] = [
  {
    label: '入力',
    views: [
      { value: 'reception', label: '持出/廃棄' },
      { value: 'order', label: '注文/搬入' },
      { value: 'stocktake', label: '棚卸', wide: true },
      { value: 'repair', label: '修理', wide: true },
    ],
  },
  {
    label: '管理',
    views: [
      { value: 'printers', label: 'プリンター状況', wide: true },
      { value: 'pages', label: '印刷状況', wide: true },
      { value: 'models', label: 'トナー個数状況', wide: true },
      { value: 'delivery', label: 'トナー入出状況', wide: true },
    ],
  },
  {
    label: '登録',
    views: [
      { value: 'asset', label: 'プリンター登録', wide: true },
      { value: 'toner', label: 'トナー登録', wide: true },
      { value: 'vendor', label: '保守登録', wide: true },
      { value: 'company', label: '会社登録', wide: true },
    ],
  },
  {
    label: '調整中',
    views: [
      { value: 'cost', label: '運用コスト', wide: true },
      { value: 'invoice', label: '請求書入力', wide: true },
      { value: 'invoiceCheck', label: '請求書状況', wide: true },
      { value: 'labelMeter', label: 'ラベル印字状況', wide: true },
    ],
  },
]

/** まとまりを解いた一覧。既定の画面や wide の判定に使う */
const VIEWS = GROUPS.flatMap((group) => group.views)

const SCREENS: Record<View, ComponentType> = {
  reception: ReceptionScreen,
  order: OrderScreen,
  delivery: DeliveryScreen,
  printers: PrinterListScreen,
  pages: PageCountScreen,
  asset: AssetScreen,
  toner: TonerScreen,
  models: ModelTonerScreen,
  cost: CostScreen,
  stocktake: StockTakeScreen,
  repair: RepairScreen,
  vendor: MaintVendorScreen,
  company: CompanyScreen,
  invoice: InvoiceScreen,
  invoiceCheck: InvoiceCheckScreen,
  labelMeter: LabelMeterScreen,
}

const timeFormat = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
const dateFormat = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
})

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

export default function App() {
  const [view, setView] = useState<View>('reception')
  /** 開いているまとまり。マウスを置くか、押すと開く */
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const now = useClock()
  const { companies, companyId, company, select, reload } = useCompanies()
  const Screen = SCREENS[view]
  const wide = VIEWS.find((item) => item.value === view)?.wide === true

  return (
    <CompanyProvider value={{ companies, companyId, company, select, reload }}>
    <div className="station">
      <header className="station__bar">
        <h1 className="station__title">トナー管理</h1>

        <nav className="nav" aria-label="画面">
          {GROUPS.map((group) => {
            const open = openGroup === group.label
            // そのまとまりの中に今の画面があれば、たたんでいても分かるように名前を出す
            const current = group.views.find((item) => item.value === view)

            return (
              <div
                className={`nav__group${open ? ' nav__group--open' : ''}${
                  current ? ' nav__group--on' : ''
                }`}
                key={group.label}
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() =>
                  setOpenGroup((prev) => (prev === group.label ? null : prev))
                }
                // キーボードで入ったときも開く。まとまりの外へ出たら閉じる
                onFocus={() => setOpenGroup(group.label)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setOpenGroup(null)
                  }
                }}
              >
                <button
                  aria-expanded={open}
                  aria-haspopup="true"
                  className="nav__trigger"
                  onClick={() => setOpenGroup(open ? null : group.label)}
                  type="button"
                >
                  <span className="nav__group-label">{group.label}</span>
                  <span className="nav__current">
                    {current ? current.label : '　'}
                  </span>
                  <span aria-hidden className="nav__caret">
                    ▾
                  </span>
                </button>

                {open && (
                  <div className="nav__menu" role="menu" aria-label={group.label}>
                    {group.views.map((item) => (
                      <button
                        aria-current={view === item.value ? 'page' : undefined}
                        className={`nav__item${
                          view === item.value ? ' nav__item--on' : ''
                        }`}
                        key={item.value}
                        onClick={() => {
                          setView(item.value)
                          setOpenGroup(null)
                        }}
                        role="menuitem"
                        type="button"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/*
          * 会社の切り替え。**在庫と受け払いを分ける単位。**
          * 持ち出し・注文・棚卸とトナーの 2 画面がこの会社の分だけを扱う。
          * プリンター状況・印刷状況・修理・請求書は全社まとめて出すので変わらない。
          * 認証が無いので、これは「見せない」仕組みではない
          */}
        <label className="station__company">
          <span className="station__company-label">会社</span>
          <select
            value={companyId ?? ''}
            onChange={(e) => select(Number(e.target.value))}
            disabled={companies.length === 0}
            title={
              companies.length === 0
                ? '会社が登録されていません。「登録 → 会社登録」で追加してください'
                : '在庫・持ち出し・注文・棚卸をこの会社の分だけ扱います（プリンター状況や修理は全社のままです）'
            }
          >
            {companies.length === 0 ? (
              <option value="">会社が未登録</option>
            ) : (
              companies.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))
            )}
          </select>
        </label>

        <p className="station__clock">
          <span className="station__date">{dateFormat.format(now)}</span>
          <time className="station__time">{timeFormat.format(now)}</time>
        </p>
      </header>

      <main className={`station__main${wide ? ' station__main--wide' : ''}`}>
        <Screen />
      </main>
    </div>
    </CompanyProvider>
  )
}
