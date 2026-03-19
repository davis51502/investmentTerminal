import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Home() {
  const { user, profile } = useAuth()

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_40%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(12,18,28,0.95))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300/80">Terminal</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white">
          Live markets, account-backed profiles, and global ticker search.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Use `/` from anywhere to jump to pages or search for a ticker/company. Market quotes are now designed to come from the backend proxy instead of mock-only client state.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/markets" className="rounded-xl bg-emerald-400 px-4 py-2.5 font-medium text-slate-950">
            Open Markets
          </Link>
          <Link to={user ? '/settings' : '/auth'} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-slate-100">
            {user ? 'Edit Profile' : 'Sign In'}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Market data</h2>
          <p className="mt-2 text-sm text-slate-300">Backend-proxied quote polling keeps your API key off the client.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Profiles</h2>
          <p className="mt-2 text-sm text-slate-300">
            {user ? `Logged in as ${profile?.username || user.email}.` : 'Supabase auth and profiles are ready to connect.'}
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Global search</h2>
          <p className="mt-2 text-sm text-slate-300">Press `/` to search routes, tickers, and companies anywhere in the app.</p>
        </article>
      </div>
    </section>
  )
}

export default Home
