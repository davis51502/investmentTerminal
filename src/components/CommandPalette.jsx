import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import routes from '../data/searchIndex.js'
import { apiUrl } from '../lib/api.js'

function scoreItem(item, query) {
  const haystack = `${item.label} ${item.description || ''} ${item.symbol || ''} ${item.exchange || ''}`.toLowerCase()
  const needle = query.toLowerCase()
  if (!needle) return 0
  if (haystack.startsWith(needle)) return 100
  if (haystack.includes(needle)) return 75
  return 0
}

function formatResult(result) {
  if (result.kind === 'market') {
    return result.exchange ? `${result.name} • ${result.exchange}` : result.name
  }
  return result.description
}

function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [marketResults, setMarketResults] = useState([])
  const [loading, setLoading] = useState(false)
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    if (!open) return

    const trimmed = deferredQuery.trim()
    if (trimmed.length < 1) {
      return
    }

    const controller = new AbortController()

    fetch(apiUrl(`/api/market/search?q=${encodeURIComponent(trimmed)}`), { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Search failed')))
      .then((payload) => {
        setMarketResults(
          Array.isArray(payload.data)
            ? payload.data.map((item) => ({ ...item, kind: 'market', id: `market-${item.symbol}` }))
            : [],
        )
      })
      .catch(() => {
        setMarketResults([])
      })
      .finally(() => {
        setLoading(false)
      })

    return () => controller.abort()
  }, [deferredQuery, open])

  const results = useMemo(() => {
    const trimmed = deferredQuery.trim()
    const base = trimmed
      ? [...routes, ...marketResults]
          .map((item) => ({ ...item, _score: scoreItem(item, trimmed) }))
          .filter((item) => item._score > 0)
          .sort((a, b) => b._score - a._score)
      : routes

    return base.slice(0, 10)
  }, [deferredQuery, marketResults])

  if (!open) return null

  function handleSelect(result) {
    if (result.kind === 'market') {
      navigate(`/markets?symbol=${encodeURIComponent(result.symbol)}`)
    } else {
      navigate(result.path)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/70 px-4 py-12 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0e1624] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-3">
            <span className="text-sm text-emerald-300">/</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value
                setQuery(nextQuery)
                setLoading(Boolean(nextQuery.trim()))
              }}
              placeholder="Search pages, tickers, or company names"
              className="w-full bg-transparent py-3 text-white outline-none placeholder:text-slate-500"
            />
            {loading && <span className="text-xs text-slate-400">searching</span>}
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {results.length ? (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelect(result)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
              >
                <div>
                  <div className="font-medium text-white">{result.symbol || result.label}</div>
                  <div className="text-sm text-slate-400">{formatResult(result)}</div>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{result.kind}</div>
              </button>
            ))
          ) : (
            <div className="px-3 py-8 text-center text-sm text-slate-400">
              No matches yet. Try `AAPL`, `Tesla`, or `portfolio`.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
