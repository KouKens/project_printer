import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import './App.css'
import AssetScreen from './screens/AssetScreen'
import OrderScreen from './screens/OrderScreen'
import PageCountScreen from './screens/PageCountScreen'
import PrinterListScreen from './screens/PrinterListScreen'
import PrinterScreen from './screens/PrinterScreen'
import ReceptionScreen from './screens/ReceptionScreen'
import RepairScreen from './screens/RepairScreen'
import StockTakeScreen from './screens/StockTakeScreen'
import TonerScreen from './screens/TonerScreen'

type View =
  | 'reception'
  | 'order'
  | 'printer'
  | 'printers'
  | 'pages'
  | 'asset'
  | 'toner'
  | 'stocktake'
  | 'repair'

/**
 * wide = 表を並べる画面。
 * 受付・注文は伝票を模した 620px の幅に収めるが、一覧は列が多く収まらないので
 * 窓いっぱいまで使う。
 */
const VIEWS: { value: View; label: string; wide?: boolean }[] = [
  { value: 'reception', label: '受付' },
  { value: 'order', label: '注文' },
  { value: 'printer', label: '機器' },
  { value: 'printers', label: '機器一覧', wide: true },
  { value: 'pages', label: '印刷枚数', wide: true },
  { value: 'asset', label: '端末情報', wide: true },
  { value: 'toner', label: 'トナー登録', wide: true },
  { value: 'stocktake', label: '棚卸し', wide: true },
  { value: 'repair', label: '修理履歴', wide: true },
]

const SCREENS: Record<View, ComponentType> = {
  reception: ReceptionScreen,
  order: OrderScreen,
  printer: PrinterScreen,
  printers: PrinterListScreen,
  pages: PageCountScreen,
  asset: AssetScreen,
  toner: TonerScreen,
  stocktake: StockTakeScreen,
  repair: RepairScreen,
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
  const now = useClock()
  const Screen = SCREENS[view]
  const wide = VIEWS.find((item) => item.value === view)?.wide === true

  return (
    <div className="station">
      <header className="station__bar">
        <h1 className="station__title">トナー管理</h1>

        <nav className="nav" aria-label="画面">
          {VIEWS.map((item) => (
            <button
              aria-current={view === item.value ? 'page' : undefined}
              className={`nav__item${view === item.value ? ' nav__item--on' : ''}`}
              key={item.value}
              onClick={() => setView(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <p className="station__clock">
          <span className="station__date">{dateFormat.format(now)}</span>
          <time className="station__time">{timeFormat.format(now)}</time>
        </p>
      </header>

      <main className={`station__main${wide ? ' station__main--wide' : ''}`}>
        <Screen />
      </main>
    </div>
  )
}
