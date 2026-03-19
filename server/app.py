from __future__ import annotations

import json
import os
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import yfinance as yf


ROOT_DIR = Path(__file__).resolve().parent.parent
PORT = int(os.getenv("PORT", "8787"))
DETAILS_CACHE_TTL_SECONDS = 900
DETAILS_CACHE: dict[str, dict] = {}


def load_env_file(filename: Path) -> None:
    if not filename.exists():
        return

    for line in filename.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("'\""))


load_env_file(ROOT_DIR / ".env")
load_env_file(ROOT_DIR / ".env.local")


def get_supabase_public_config() -> dict[str, str | bool]:
    url = os.getenv("VITE_SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or ""
    anon_key = (
        os.getenv("VITE_SUPABASE_ANON_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        or ""
    )
    return {
        "url": url,
        "anonKey": anon_key,
        "configured": bool(url and anon_key),
    }


class MarketHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._set_headers()
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path
        params = parse_qs(parsed.query)

        if route == "/api/health":
            self._send_json(
                200,
                {
                    "ok": True,
                    "provider": "yfinance",
                    "configured": True,
                    "note": "Yahoo Finance data can be delayed depending on the symbol/exchange.",
                },
            )
            return

        if route == "/api/config":
            self._send_json(200, {"supabase": get_supabase_public_config()})
            return

        if route == "/api/market/quotes":
            symbols = [
                symbol.strip().upper()
                for symbol in ",".join(params.get("symbols", [""])).split(",")
                if symbol.strip()
            ][:25]

            if not symbols:
                self._send_json(400, {"error": "Provide at least one symbol"})
                return

            try:
                self._send_json(200, {"data": fetch_quotes(symbols)})
            except Exception as exc:  # pragma: no cover
                self._send_json(502, {"error": "Unable to fetch Yahoo Finance quotes", "detail": str(exc)})
            return

        if route == "/api/market/search":
            query = (params.get("q", [""])[0] or "").strip()
            if not query:
                self._send_json(400, {"error": "Query is required"})
                return

            try:
                self._send_json(200, {"data": search_symbols(query)})
            except Exception as exc:  # pragma: no cover
                self._send_json(502, {"error": "Unable to search Yahoo Finance symbols", "detail": str(exc)})
            return

        if route == "/api/market/details":
            symbol = (params.get("symbol", [""])[0] or "").strip().upper()
            if not symbol:
                self._send_json(400, {"error": "Symbol is required"})
                return

            try:
                self._send_json(200, {"data": fetch_ticker_details(symbol)})
            except Exception as exc:  # pragma: no cover
                self._send_json(502, {"error": "Unable to fetch Yahoo Finance ticker details", "detail": str(exc)})
            return

        self._send_json(404, {"error": "Not found"})

    def log_message(self, _format: str, *_args: object) -> None:
        return

    def _set_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Content-Type", "application/json; charset=utf-8")

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self._set_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def fetch_quotes(symbols: list[str]) -> list[dict]:
    tickers = yf.Tickers(" ".join(symbols))
    quotes: list[dict] = []

    for symbol in symbols:
        ticker = tickers.tickers.get(symbol) or yf.Ticker(symbol)
        info = ticker.fast_info or {}
        meta = ticker.info or {}

        price = _number(info.get("lastPrice")) or _number(meta.get("currentPrice")) or _number(meta.get("regularMarketPrice"))
        previous_close = _number(info.get("previousClose")) or _number(meta.get("previousClose")) or price or 0.0
        if price is None:
            continue

        change = price - previous_close
        percent = (change / previous_close * 100) if previous_close else 0.0

        quotes.append(
            {
                "symbol": symbol,
                "name": meta.get("shortName") or meta.get("longName") or symbol,
                "exchange": meta.get("exchange") or meta.get("fullExchangeName"),
                "price": price,
                "previousClose": previous_close,
                "change": change,
                "percent": percent,
                "currency": meta.get("currency") or "USD",
                "isMarketOpen": None,
            }
        )

    return quotes


def search_symbols(query: str) -> list[dict]:
    search = yf.Search(query=query, max_results=12)
    quotes = getattr(search, "quotes", []) or []
    results: list[dict] = []

    for item in quotes[:12]:
        symbol = item.get("symbol")
        if not symbol:
            continue
        results.append(
            {
                "symbol": symbol,
                "name": item.get("shortname") or item.get("longname") or symbol,
                "exchange": item.get("exchange") or item.get("exchDisp"),
                "country": item.get("exchangeCountry"),
                "type": item.get("quoteType"),
            }
        )

    return results


def fetch_ticker_details(symbol: str) -> dict:
    ticker = yf.Ticker(symbol)
    cached = DETAILS_CACHE.get(symbol)
    if cached and (time.time() - cached["ts"]) < DETAILS_CACHE_TTL_SECONDS:
        return cached["data"]

    info = _safe_fast_info(ticker)
    meta = _safe_info(ticker)
    history = _safe_history(ticker)
    news_items = _safe_news(ticker)

    price = _number(info.get("lastPrice")) or _number(meta.get("currentPrice")) or _number(meta.get("regularMarketPrice")) or 0.0
    previous_close = _number(info.get("previousClose")) or _number(meta.get("previousClose")) or price or 0.0
    change = price - previous_close
    percent = (change / previous_close * 100) if previous_close else 0.0

    history_points = []
    if hasattr(history, "iterrows"):
        history_points = [
            {
                "date": index.strftime("%Y-%m-%d"),
                "close": _number(row.get("Close")) or 0.0,
            }
            for index, row in history.iterrows()
        ]

    normalized_news = []
    for item in news_items[:8]:
        content = item.get("content") or {}
        normalized_news.append(
            {
                "title": content.get("title") or item.get("title") or "Untitled story",
                "publisher": content.get("provider", {}).get("displayName") or item.get("publisher") or "Yahoo Finance",
                "summary": content.get("summary") or content.get("description") or "",
                "url": content.get("canonicalUrl", {}).get("url") or item.get("link") or item.get("url") or "",
                "publishedAt": content.get("pubDate") or item.get("providerPublishTime") or "",
            }
        )

    detail = {
        "symbol": symbol,
        "name": meta.get("shortName") or meta.get("longName") or symbol,
        "exchange": meta.get("exchange") or meta.get("fullExchangeName"),
        "price": price,
        "previousClose": previous_close,
        "change": change,
        "percent": percent,
        "currency": meta.get("currency") or "USD",
        "sector": meta.get("sectorDisp") or meta.get("sector") or "",
        "history": history_points,
        "news": normalized_news,
    }
    DETAILS_CACHE[symbol] = {"ts": time.time(), "data": detail}
    return detail


def _safe_fast_info(ticker: yf.Ticker) -> dict:
    try:
        return ticker.fast_info or {}
    except Exception:
        return {}


def _safe_info(ticker: yf.Ticker) -> dict:
    try:
        return ticker.info or {}
    except Exception:
        return {}


def _safe_history(ticker: yf.Ticker):
    try:
        return ticker.history(period="1mo", interval="1d")
    except Exception:
        return []


def _safe_news(ticker: yf.Ticker) -> list[dict]:
    try:
        return getattr(ticker, "news", []) or []
    except Exception:
        return []


def _number(value: object) -> float | None:
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), MarketHandler)
    print(f"Market backend listening on http://localhost:{PORT}")
    server.serve_forever()
