const FALLBACK_SYMBOLS = ['AAPL', 'MSFT', 'NVDA']

function storageKey(userId) {
  return `investment-terminal-portfolio:${userId}`
}

export function loadPortfolioSymbols(userId) {
  if (!userId || typeof window === 'undefined') return FALLBACK_SYMBOLS

  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    if (!raw) return FALLBACK_SYMBOLS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : FALLBACK_SYMBOLS
  } catch {
    return FALLBACK_SYMBOLS
  }
}

export function savePortfolioSymbols(userId, symbols) {
  if (!userId || typeof window === 'undefined') return
  window.localStorage.setItem(storageKey(userId), JSON.stringify(symbols))
}
