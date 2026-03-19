import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import CommandPalette from '../components/CommandPalette.jsx'
import watchlist from '../data/watchlist.js'
import useRealtimePrices from '../lib/useRealtimePrices.js'

function SidebarWatchlist() {
  const { data } = useRealtimePrices(watchlist)

  return (
    <aside className="hidden lg:block w-72 shrink-0 px-3 py-4">
      <div className="bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200">Watchlist</h3>
          <span className="text-[10px] text-slate-400">Realtime</span>
        </div>
        <ul className="space-y-1">
          {watchlist.map((sym) => {
            const item = data[sym]
            const isUp = (item?.change ?? 0) >= 0
            return (
              <li key={sym} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-white/5">
                <span className="text-slate-300 font-medium">{sym}</span>
                <span className={`font-mono ${isUp ? 'text-gain' : 'text-loss'}`}>
                  {item?.price?.toFixed?.(2) ?? '—'}
                  {item?.percent != null && (
                    <span className={`ml-2 text-xs ${isUp ? 'text-gain' : 'text-loss'}`}>
                      {isUp ? '▲' : '▼'} {Math.abs(item.percent).toFixed(2)}%
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
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
      {paletteOpen && <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <SidebarWatchlist />
          <div className="min-w-0 flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
