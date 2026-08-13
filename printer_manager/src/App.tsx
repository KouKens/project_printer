import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import './App.css'
import OrderScreen from './screens/OrderScreen'
import PrinterScreen from './screens/PrinterScreen'
import ReceptionScreen from './screens/ReceptionScreen'

type View = 'reception' | 'order' | 'printer'

const VIEWS: { value: View; label: string }[] = [
  { value: 'reception', label: '受付' },
  { value: 'order', label: '注文' },
  { value: 'printer', label: '機器' },
]

const SCREENS: Record<View, ComponentType> = {
  reception: ReceptionScreen,
  order: OrderScreen,
  printer: PrinterScreen,
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

      <main className="station__main">
        <Screen />
      </main>
    </div>
  )
}
