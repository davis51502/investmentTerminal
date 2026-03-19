import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import MarketCard from '../components/MarketCard.jsx'
import TickerDetailPanel from '../components/TickerDetailPanel.jsx'
import watchlist from '../data/watchlist.js'
import useRealtimePrices from '../lib/useRealtimePrices.js'

function MarketsGrid({ symbols, selectedSymbol }) {
  const { list, usingLiveData } = useRealtimePrices(symbols)
  const [activeSymbol, setActiveSymbol] = useState(selectedSymbol || null)

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Markets</h1>
        <span className="text-xs text-slate-400">{usingLiveData ? 'Yahoo Finance quotes via yfinance backend' : 'Live (simulated)'}</span>
      </div>
      {selectedSymbol && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          Focused result: `{selectedSymbol}` from global search.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map(({ symbol, price, change, percent, series }) => (
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
    </>
  )
}

function Markets() {
  const [searchParams] = useSearchParams()
  const selectedSymbol = searchParams.get('symbol')?.toUpperCase()
  const symbols = useMemo(
    () => (selectedSymbol && !watchlist.includes(selectedSymbol) ? [selectedSymbol, ...watchlist] : watchlist),
    [selectedSymbol],
  )
  return (
    <section className="space-y-4">
      <MarketsGrid key={symbols.join(',')} symbols={symbols} selectedSymbol={selectedSymbol} />
    </section>
  )
}

export default Markets
