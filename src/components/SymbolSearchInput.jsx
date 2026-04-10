import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../lib/api.js'

function formatMeta(result) {
  const parts = [result.name, result.exchange].filter(Boolean)
  return parts.join(' • ')
}

function SymbolSearchInput({ value, onChange, onSelect, existingSymbols = [], placeholder = 'Search company or ticker' }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const deferredValue = useDeferredValue(value)
  const normalizedExisting = useMemo(() => existingSymbols.map((symbol) => symbol.toUpperCase()), [existingSymbols])
  const canSearch = deferredValue.trim().length >= 2

  useEffect(() => {
    const query = deferredValue.trim()
    if (query.length < 2) return

    const controller = new AbortController()

    fetch(apiUrl(`/api/market/search?q=${encodeURIComponent(query)}`), { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Search failed')))
      .then((payload) => {
        const nextResults = Array.isArray(payload.data) ? payload.data : []
        setResults(nextResults)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResults([])
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [deferredValue])

  const visibleResults = canSearch ? results : []

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value
            onChange(nextValue)
            setLoading(nextValue.trim().length >= 2)
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
        />
      </div>

      {(loading || visibleResults.length > 0) && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-[#08111d] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-400">Searching symbols...</div>
          )}
          {!loading && visibleResults.length > 0 && (
            <ul className="max-h-80 overflow-y-auto p-2">
              {visibleResults.map((result) => {
                const alreadyAdded = normalizedExisting.includes(result.symbol?.toUpperCase?.())
                return (
                  <li key={`${result.symbol}-${result.exchange || 'market'}`}>
                    <button
                      type="button"
                      onClick={() => onSelect(result)}
                      disabled={alreadyAdded}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div>
                        <div className="font-medium text-white">{result.symbol}</div>
                        <div className="text-sm text-slate-400">{formatMeta(result)}</div>
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                        {alreadyAdded ? 'Added' : result.type || 'Equity'}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default SymbolSearchInput
