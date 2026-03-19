import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/api.js'

function DetailChart({ points = [], up }) {
  const width = 640
  const height = 220

  if (!points.length) {
    return <div className="h-56 rounded-2xl border border-white/10 bg-black/20" />
  }

  const values = points.map((point) => point.close)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const step = width / Math.max(points.length - 1, 1)
  const norm = (value) => {
    if (max === min) return height / 2
    return height - ((value - min) / (max - min)) * height
  }

  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${norm(point.close)}`).join(' ')
  const stroke = up ? '#34d399' : '#fb7185'
  const fill = up ? 'rgba(52,211,153,0.15)' : 'rgba(251,113,133,0.15)'

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_35%),linear-gradient(180deg,rgba(9,14,22,0.9),rgba(5,8,18,0.95))]">
      <path d={`${line} L ${width} ${height} L 0 ${height} Z`} fill={fill} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="3" />
    </svg>
  )
}

function formatPublished(value) {
  if (!value) return 'Recent'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recent'
  return date.toLocaleString()
}

function TickerDetailPanel({ symbol, onClose }) {
  const [state, setState] = useState({ loading: true, error: '', data: null })

  useEffect(() => {
    const controller = new AbortController()

    fetch(apiUrl(`/api/market/details?symbol=${encodeURIComponent(symbol)}`), { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load ticker details')))
      .then((payload) => {
        setState({ loading: false, error: '', data: payload.data || null })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setState({ loading: false, error: error.message, data: null })
      })

    return () => controller.abort()
  }, [symbol])

  const detail = state.data
  const up = (detail?.change ?? 0) >= 0

  return (
    <div className="fixed inset-0 z-[80] bg-[#020611]/85 px-4 py-6 backdrop-blur-md" onClick={onClose}>
      <div
        className="mx-auto flex max-h-[92vh] max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-[linear-gradient(160deg,rgba(8,14,26,0.98),rgba(4,7,16,0.98))] shadow-[0_40px_160px_rgba(0,0,0,0.65)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/70">Ticker Intelligence</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{symbol}</h2>
            {detail?.name && <p className="mt-1 text-sm text-slate-400">{detail.name}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
            Close
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1.3fr_0.9fr]">
          <section className="space-y-4">
            {state.loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">Loading chart and news...</div>
            ) : state.error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100">{state.error}</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Last</div>
                    <div className="mt-2 text-3xl font-semibold text-white">{detail?.price?.toFixed?.(2) ?? '—'}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Move</div>
                    <div className={`mt-2 text-3xl font-semibold ${up ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {up ? '+' : ''}{detail?.percent?.toFixed?.(2) ?? '0.00'}%
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Context</div>
                    <div className="mt-2 text-sm text-slate-300">{detail?.sector || detail?.exchange || 'Market'}</div>
                  </div>
                </div>
                <DetailChart points={detail?.history || []} up={up} />
                <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  Click-through news is pulled per ticker so you can quickly connect a move with current headlines. It is directional context, not a full causality model.
                </p>
              </>
            )}
          </section>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Why It Moved</div>
              <p className="mt-2 text-sm text-slate-300">
                Recent company headlines and market coverage tied to {symbol}.
              </p>
            </div>
            {(detail?.news || []).length ? (
              detail.news.map((item, index) => (
                <a
                  key={`${item.url}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 transition hover:border-emerald-400/30 hover:bg-white/8"
                >
                  <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    <span>{item.publisher}</span>
                    <span>{formatPublished(item.publishedAt)}</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
                  {item.summary && <p className="mt-2 text-sm leading-6 text-slate-300">{item.summary}</p>}
                </a>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                No recent linked stories were returned for this ticker.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default TickerDetailPanel
