import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SymbolSearchInput from '../components/SymbolSearchInput.jsx'
import TickerDetailPanel from '../components/TickerDetailPanel.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import usePortfolioSymbols from '../lib/usePortfolioSymbols.js'
import useRealtimePrices from '../lib/useRealtimePrices.js'

const QUICK_PICKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'META', name: 'Meta' },
]

function PortfolioWorkspace({ user, profile }) {
  const [symbols, setSymbols] = usePortfolioSymbols(user.id)
  const [draftSymbol, setDraftSymbol] = useState('')
  const [activeSymbol, setActiveSymbol] = useState(null)

  const normalizedSymbols = useMemo(() => symbols.map((symbol) => symbol.toUpperCase()), [symbols])
  const { list, usingLiveData } = useRealtimePrices(normalizedSymbols)

  function handleAddSymbol(event) {
    event.preventDefault()
    const next = draftSymbol.trim().toUpperCase()
    if (!next || symbols.includes(next)) return
    setSymbols((prev) => [...prev, next])
    setDraftSymbol('')
  }

  function handleSelectResult(result) {
    const next = result.symbol?.trim()?.toUpperCase()
    if (!next || symbols.includes(next)) return
    setSymbols((prev) => [...prev, next])
    setDraftSymbol('')
  }

  function handleRemoveSymbol(symbol) {
    setSymbols((prev) => prev.filter((item) => item !== symbol))
  }

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(150deg,rgba(13,20,34,0.94),rgba(5,8,18,0.94))] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/70">Portfolio Lab</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Build a personal symbol slate</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Add tickers you actually care about, track them in one place, and click into each one for move context and recent company news.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Feed</div>
            <div className="mt-1 text-sm text-white">{usingLiveData ? 'Yahoo Finance live quotes' : 'Fallback simulation'}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white">Add companies without memorizing tickers</h2>
            <p className="mt-2 text-sm text-slate-300">Search by company name or ticker, then add the result directly from the list.</p>
            <form onSubmit={handleAddSymbol} className="mt-4 space-y-4">
              <SymbolSearchInput
                value={draftSymbol}
                onChange={setDraftSymbol}
                onSelect={handleSelectResult}
                existingSymbols={symbols}
                placeholder="Tesla, Apple, NVIDIA, SPY..."
              />
              <div className="flex gap-2">
                <button type="submit" className="rounded-xl bg-emerald-400 px-4 py-2 font-medium text-slate-950">
                  Add typed symbol
                </button>
              </div>
            </form>
            <div className="mt-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Quick picks</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_PICKS.map((item) => {
                  const alreadyAdded = symbols.includes(item.symbol)
                  return (
                    <button
                      key={item.symbol}
                      type="button"
                      onClick={() => handleSelectResult(item)}
                      disabled={alreadyAdded}
                      className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-400/30 hover:text-white disabled:opacity-40"
                    >
                      {item.name} <span className="text-slate-500">{item.symbol}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <h2 className="text-lg font-semibold text-white">Account anchor</h2>
            <p className="mt-2 text-sm text-slate-300">{profile?.full_name || user.email}</p>
            <p className="mt-2 text-sm text-slate-400">Favorite ticker: {profile?.favorite_ticker || 'not set'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {list.map(({ symbol, name, price, change, percent }) => (
              <div key={symbol} className="rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-slate-400">{name || symbol}</div>
                    <button type="button" onClick={() => setActiveSymbol(symbol)} className="mt-1 text-xl font-semibold tracking-wide text-white">
                      {symbol}
                    </button>
                  </div>
                  <button type="button" onClick={() => handleRemoveSymbol(symbol)} className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Remove
                  </button>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div className="text-3xl font-semibold text-white">{price?.toFixed?.(2) ?? '—'}</div>
                  <div className={`text-sm font-medium ${(change ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {(change ?? 0) >= 0 ? '+' : ''}{percent?.toFixed?.(2) ?? '0.00'}%
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSymbol(symbol)}
                  className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100"
                >
                  Open chart and news
                </button>
              </div>
            ))}
          </div>
          {!list.length && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400">
              Add your first ticker to start building the portfolio slate.
            </div>
          )}
        </div>
      </div>
      {activeSymbol && <TickerDetailPanel symbol={activeSymbol} onClose={() => setActiveSymbol(null)} />}
    </section>
  )
}

function Portfolio() {
  const { user, profile } = useAuth()

  if (!user) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white">Portfolio</h1>
        <p className="mt-3 text-slate-300">
          Sign in first so holdings and watchlists can be attached to your account.
        </p>
        <Link to="/auth" className="mt-5 inline-flex rounded-xl bg-emerald-400 px-4 py-2.5 font-medium text-slate-950">
          Sign in
        </Link>
      </section>
    )
  }

  return <PortfolioWorkspace key={user.id} user={user} profile={profile} />
}

export default Portfolio
