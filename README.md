# Investment Terminal

## Scripts

```bash
npm install
python3 -m pip install -r requirements.txt
npm run dev
npm run dev:client
npm run dev:server
npm run build
```

`npm run dev` starts the Vite client and the local backend together.

## What changed

- Live market pricing now goes through a local backend proxy at `/api/market/*`
- The market backend now uses `yfinance` against Yahoo Finance
- Global `/` search works anywhere in the app for routes, tickers, and company names
- Supabase auth and user profile editing are wired into the frontend
- A `profiles` table schema is included at [supabase/schema.sql](/Users/daviswollesen/Desktop/School/currentSemester/Winter2026/cs356/investmentTerminal/supabase/schema.sql)

## Environment

Copy [.env.example](/Users/daviswollesen/Desktop/School/currentSemester/Winter2026/cs356/investmentTerminal/.env.example) to `.env.local` and fill in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

## Supabase

Run the SQL in [supabase/schema.sql](/Users/daviswollesen/Desktop/School/currentSemester/Winter2026/cs356/investmentTerminal/supabase/schema.sql) in the Supabase SQL editor. It creates a `profiles` table with row-level security so each user can only access their own profile.

## Yahoo Finance note

This setup now uses `yfinance`, which wraps Yahoo Finance data. That is fine for an investment dashboard, but it is not exchange-grade real-time market data and can be delayed depending on the symbol and exchange.

## Deploy

Frontend:
- Deploy to Vercel
- Set `VITE_API_BASE_URL` to your Render backend URL

Backend:
- Deploy to Render using [render.yaml](/Users/daviswollesen/Desktop/School/currentSemester/Winter2026/cs356/investmentTerminal/render.yaml)
- Render will install `requirements.txt` and run `python server/app.py`
