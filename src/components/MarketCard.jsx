function classNames(...xs) { return xs.filter(Boolean).join(' ') }

function Sparkline({ series = [], up = true }) {
  const width = 140
  const height = 40
  if (!series.length) {
    return <div className="h-10 w-full rounded bg-white/5" />
  }
  const min = Math.min(...series)
  const max = Math.max(...series)
  const norm = (v) => {
    if (max === min) return height / 2
    return height - ((v - min) / (max - min)) * height
  }
  const step = width / (series.length - 1)
  const path = series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${norm(v)}`).join(' ')
  const stroke = up ? '#10B981' : '#F43F5E'
  const fill = up ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)'
  const lastY = norm(series[series.length - 1])

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10">
      <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" />
      <circle cx={width} cy={lastY} r="2.5" fill={stroke} />
    </svg>
  )
}

function MarketCard({ symbol, name, price, change, percent, series = [], onOpen }) {
  const up = (change ?? 0) >= 0
  return (
    <button
      type="button"
      onClick={() => onOpen?.(symbol)}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.26)] transition hover:-translate-y-0.5 hover:border-emerald-400/30"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(16,185,129,0.08),transparent)] opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-400">{name || '—'}</div>
          <div className="text-lg font-semibold text-slate-100 tracking-wide">{symbol}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-slate-100">{price?.toFixed?.(2) ?? '—'}</div>
          <div className={classNames('text-sm font-medium', up ? 'text-gain' : 'text-loss')}>
            {up ? '▲' : '▼'} {Math.abs(change ?? 0).toFixed(2)} ({Math.abs(percent ?? 0).toFixed(2)}%)
          </div>
        </div>
      </div>
      <Sparkline series={series} up={up} />
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-slate-500">
        <span>Open intelligence</span>
        <span>{up ? 'Momentum' : 'Pressure'}</span>
      </div>
    </button>
  )
}

export default MarketCard
