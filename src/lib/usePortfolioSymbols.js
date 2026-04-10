import { useSyncExternalStore } from 'react'
import { loadPortfolioSymbols, savePortfolioSymbols, subscribePortfolioSymbols } from './portfolioStorage.js'

const snapshotCache = new Map()

function getPortfolioSnapshot(userId) {
  const nextSymbols = loadPortfolioSymbols(userId)
  const cacheKey = userId || '__guest__'
  const cached = snapshotCache.get(cacheKey)

  if (
    cached &&
    cached.symbols.length === nextSymbols.length &&
    cached.symbols.every((symbol, index) => symbol === nextSymbols[index])
  ) {
    return cached.symbols
  }

  snapshotCache.set(cacheKey, { symbols: nextSymbols })
  return nextSymbols
}

export default function usePortfolioSymbols(userId) {
  const symbols = useSyncExternalStore(
    subscribePortfolioSymbols,
    () => getPortfolioSnapshot(userId),
    () => getPortfolioSnapshot(userId),
  )

  function setSymbols(next) {
    const resolved = typeof next === 'function' ? next(symbols) : next
    savePortfolioSymbols(userId, resolved)
  }

  return [symbols, setSymbols]
}
