import { useSyncExternalStore } from 'react'
import { loadPortfolioSymbols, savePortfolioSymbols, subscribePortfolioSymbols } from './portfolioStorage.js'

export default function usePortfolioSymbols(userId) {
  const symbols = useSyncExternalStore(
    subscribePortfolioSymbols,
    () => loadPortfolioSymbols(userId),
    () => loadPortfolioSymbols(userId),
  )

  function setSymbols(next) {
    const resolved = typeof next === 'function' ? next(symbols) : next
    savePortfolioSymbols(userId, resolved)
  }

  return [symbols, setSymbols]
}
