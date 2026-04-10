import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import CommandPalette from '../components/CommandPalette.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import watchlist from '../data/watchlist.js'
import usePortfolioSymbols from '../lib/usePortfolioSymbols.js'
import useRealtimePrices from '../lib/useRealtimePrices.js'

function MarketTape() {
  const { user } = useAuth()
  const [portfolioSymbols] = usePortfolioSymbols(user?.id || '')
  const symbols = portfolioSymbols.length ? portfolioSymbols : watchlist
  const { data } = useRealtimePrices(symbols)
  const items = [...symbols, ...symbols]

  return (
    <div className="market-tape border-b border-white/8 bg-black/18">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="market-tape__track">
          {items.map((sym, index) => {
            const item = data[sym]
            const isUp = (item?.change ?? 0) >= 0
            return (
              <div key={`${sym}-${index}`} className="market-tape__item">
                <span className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{sym}</span>
                <span className="text-sm font-medium text-white">{item?.price?.toFixed?.(2) ?? '—'}</span>
                <span className={`text-xs font-medium ${isUp ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {isUp ? '+' : '-'}{Math.abs(item?.percent ?? 0).toFixed(2)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DashboardLayout({ children }) {
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event) {
      const target = event.target
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingTarget) {
        event.preventDefault()
        setPaletteOpen(true)
      }

      if (event.key === 'Escape') {
        setPaletteOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-[#121212] text-slate-200">
      <Header />
      <MarketTape />
      {paletteOpen && <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
