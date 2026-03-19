import { useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_BASE = {
  AAPL: 192.3,
  MSFT: 420.1,
  NVDA: 900.4,
  AMZN: 176.2,
  GOOGL: 145.8,
  META: 507.6,
  TSLA: 178.2,
  SPY: 510.4,
  QQQ: 441.3,
}

function makeInitialState(symbols) {
  const map = {}
  for (const s of symbols) {
    const base = DEFAULT_BASE[s] ?? 100 + Math.random() * 200
    map[s] = { price: base, prev: base, change: 0, percent: 0, series: Array(30).fill(base) }
  }
  return map
}

export default function useRealtimePrices(symbols = []) {
  const initialState = useMemo(() => makeInitialState(symbols), [symbols])
  const [data, setData] = useState(initialState)
  const [liveMode, setLiveMode] = useState(true)
  const intervalRef = useRef(null)

  // Keep series at max length
  const pushPoint = (series, v, max = 40) => {
    const next = [...series, v]
    if (next.length > max) next.shift()
    return next
  }

  // Mock generator fallback when no key is provided
  useEffect(() => {
    if (liveMode) return
    const id = setInterval(() => {
      setData((prev) => {
        const next = Object.keys(prev).length ? { ...prev } : { ...initialState }
        for (const s of symbols) {
          const cur = next[s]
          if (!cur) continue
          const drift = (Math.random() - 0.5) * 0.6 // ~±0.30
          const price = Math.max(0.01, cur.price + drift)
          const change = price - cur.prev
          const percent = (change / cur.prev) * 100
          next[s] = {
            price,
            prev: cur.prev,
            change,
            percent,
            series: pushPoint(cur.series, price),
          }
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [symbols, initialState, liveMode])

  useEffect(() => {
    if (!liveMode || !symbols.length) return

    async function fetchQuotes() {
      try {
        const response = await fetch(`/api/market/quotes?symbols=${encodeURIComponent(symbols.join(','))}`)
        if (!response.ok) {
          setLiveMode(false)
          return
        }
        const payload = await response.json()
        const quotes = Array.isArray(payload.data) ? payload.data : []
        setLiveMode(true)

        setData((prev) => {
          const next = { ...prev }
          for (const quote of quotes) {
            const s = quote.symbol
            if (!symbols.includes(s)) continue
            const price = Number(quote.price ?? 0)
            const prior = next[s]?.price ?? quote.previousClose ?? price
            const change = Number(quote.change ?? price - prior)
            const percent = Number(quote.percent ?? (prior ? (change / prior) * 100 : 0))
            const baseline = next[s]?.prev ?? quote.previousClose ?? prior

            next[s] = {
              price,
              prev: baseline,
              change,
              percent,
              series: pushPoint(next[s]?.series ?? Array(30).fill(price), price),
              name: quote.name,
              exchange: quote.exchange,
            }
          }
          return next
        })
      } catch {
        setLiveMode(false)
      }
    }

    fetchQuotes()
    intervalRef.current = setInterval(fetchQuotes, 15000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [symbols, liveMode])

  const list = useMemo(
    () => symbols.map((s) => ({ symbol: s, name: data[s]?.name || s, ...data[s] })),
    [symbols, data],
  )
  return { data, list, usingLiveData: liveMode }
}
