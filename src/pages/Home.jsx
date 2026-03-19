import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Home() {
  const { user, profile } = useAuth()

  return (
    <section className="space-y-6">
      <div className="terminal-panel rounded-[2rem] border border-white/10 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300/80">Terminal</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white">
          A sharper investment cockpit with live symbols, move context, and research hooks.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Use `/` from anywhere to jump to pages or search for a ticker/company. Click into any tracked name to inspect price action and recent headlines around the move.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/markets" className="rounded-xl bg-emerald-400 px-4 py-2.5 font-medium text-slate-950">
            Open Markets
          </Link>
          <Link to="/portfolio" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-slate-100">
            Build Portfolio
          </Link>
          <Link to={user ? '/settings' : '/auth'} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-slate-100">
            {user ? 'Edit Profile' : 'Sign In'}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Market data</h2>
          <p className="mt-2 text-sm text-slate-300">Backend-proxied Yahoo quotes keep the browser thin and let you add ticker-level context like headlines and history.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Profiles</h2>
          <p className="mt-2 text-sm text-slate-300">
            {user ? `Logged in as ${profile?.username || user.email}.` : 'Supabase auth and profiles are ready to connect.'}
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Ticker intelligence</h2>
          <p className="mt-2 text-sm text-slate-300">Open a chart, then scan the linked company news next to the move instead of bouncing between tabs.</p>
        </article>
      </div>
    </section>
  )
}

export default Home
