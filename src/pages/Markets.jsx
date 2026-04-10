import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import MarketCard from '../components/MarketCard.jsx'
import SymbolSearchInput from '../components/SymbolSearchInput.jsx'
import TickerDetailPanel from '../components/TickerDetailPanel.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import usePortfolioSymbols from '../lib/usePortfolioSymbols.js'
import useRealtimePrices from '../lib/useRealtimePrices.js'

const MARKET_PRESETS = [
  {
    id: 'core',
    label: 'Core US',
    description: 'Broad market and risk-on benchmarks',
    symbols: ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI'],
  },
  {
    id: 'leaders',
    label: 'Mega Cap',
    description: 'The names most users actually want first',
    symbols: ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA'],
  },
  {
    id: 'semis',
    label: 'Semis',
    description: 'AI and chip complex',
    symbols: ['NVDA', 'AMD', 'AVGO', 'QCOM', 'TSM'],
  },
  {
    id: 'finance',
    label: 'Financials',
    description: 'Banks, cards, and capital markets',
    symbols: ['JPM', 'GS', 'MS', 'V', 'MA'],
  },
]

function sortList(list, sortBy) {
  const next = [...list]

  if (sortBy === 'move') {
    return next.sort((a, b) => Math.abs(b.percent ?? 0) - Math.abs(a.percent ?? 0))
  }

  if (sortBy === 'price') {
    return next.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
  }

  return next.sort((a, b) => a.symbol.localeCompare(b.symbol))
}

function Markets() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const selectedSymbol = searchParams.get('symbol')?.toUpperCase()
  const [activePreset, setActivePreset] = useState(MARKET_PRESETS[0].id)
  const [sortBy, setSortBy] = useState('move')
  const [searchValue, setSearchValue] = useState('')
  const [extraSymbols, setExtraSymbols] = useState(() => (selectedSymbol ? [selectedSymbol] : []))
  const [activeSymbol, setActiveSymbol] = useState(selectedSymbol || null)
  const [portfolioSymbols, setPortfolioSymbols] = usePortfolioSymbols(user?.id || '')

  const preset = MARKET_PRESETS.find((item) => item.id === activePreset) || MARKET_PRESETS[0]
  const symbols = useMemo(() => {
    const merged = [...extraSymbols, ...preset.symbols]
    return merged.filter((symbol, index) => merged.indexOf(symbol) === index)
  }, [extraSymbols, preset.symbols])

  const { list, usingLiveData } = useRealtimePrices(symbols)
  const sortedList = useMemo(() => sortList(list, sortBy), [list, sortBy])
  const spotlight = sortedList[0]

  function handleSearchSelect(result) {
    const symbol = result.symbol?.toUpperCase?.()
    if (!symbol) return
    setExtraSymbols((prev) => (prev.includes(symbol) ? prev : [symbol, ...prev].slice(0, 6)))
    setSearchValue('')
    setActiveSymbol(symbol)
  }

  function handleSaveToPortfolio(symbol) {
    if (!user || portfolioSymbols.includes(symbol)) return
    setPortfolioSymbols((prev) => [...prev, symbol])
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(10,16,28,0.98),rgba(5,9,18,0.98))] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.38)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.34em] text-slate-500">Markets Workbench</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Explore the market by theme, then save what matters.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Start from a curated US market board, search companies by name, sort by movement, and push the names you care about into your portfolio slate.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Feed</div>
            <div className="mt-1 text-sm text-white">{usingLiveData ? 'Yahoo Finance live board' : 'Fallback simulation'}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Discover Symbols</div>
                <p className="mt-2 text-sm text-slate-400">Search companies without leaving the app.</p>
              </div>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="move">Sort by move</option>
                <option value="price">Sort by price</option>
                <option value="alpha">Sort A-Z</option>
              </select>
            </div>
            <div className="mt-4">
              <SymbolSearchInput
                value={searchValue}
                onChange={setSearchValue}
                onSelect={handleSearchSelect}
                existingSymbols={symbols}
                placeholder="Search Apple, Tesla, NVIDIA, JPMorgan..."
              />
            </div>
            {!!extraSymbols.length && (
              <div className="mt-4 flex flex-wrap gap-2">
                {extraSymbols.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => setActiveSymbol(symbol)}
                    className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Spotlight</div>
            {spotlight ? (
              <div className="mt-3">
                <button type="button" onClick={() => setActiveSymbol(spotlight.symbol)} className="text-left">
                  <div className="text-sm text-slate-400">{spotlight.name || spotlight.symbol}</div>
                  <div className="mt-1 text-3xl font-semibold text-white">{spotlight.symbol}</div>
                </button>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="text-4xl font-semibold text-white">{spotlight.price?.toFixed?.(2) ?? '—'}</div>
                  <div className={`text-sm font-medium ${(spotlight.change ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {(spotlight.change ?? 0) >= 0 ? '+' : ''}{spotlight.percent?.toFixed?.(2) ?? '0.00'}%
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSymbol(spotlight.symbol)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-white"
                  >
                    Open chart
                  </button>
                  {user && (
                    <button
                      type="button"
                      onClick={() => handleSaveToPortfolio(spotlight.symbol)}
                      className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100"
                    >
                      {portfolioSymbols.includes(spotlight.symbol) ? 'In portfolio' : 'Save to portfolio'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-400">No market data yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {MARKET_PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActivePreset(item.id)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activePreset === item.id
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-white/8 bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
        <span className="text-white">{preset.label}</span> • {preset.description}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedList.map(({ symbol, name, price, change, percent, series }) => (
          <MarketCard
            key={symbol}
            symbol={symbol}
            name={name}
            price={price}
            change={change}
            percent={percent}
            series={series}
            onOpen={setActiveSymbol}
          />
        ))}
      </div>

      {activeSymbol && <TickerDetailPanel symbol={activeSymbol} onClose={() => setActiveSymbol(null)} />}
    </section>
  )
}

export default Markets
