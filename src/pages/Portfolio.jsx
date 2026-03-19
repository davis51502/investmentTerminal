import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Portfolio() {
  const { user, profile } = useAuth()

  if (!user) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white">Portfolio</h1>
        <p className="mt-3 text-slate-300">
          Sign in first so holdings and watchlists can be attached to your account.
        </p>
        <Link to="/auth" className="mt-5 inline-flex rounded-xl bg-emerald-400 px-4 py-2.5 font-medium text-slate-950">
          Sign in
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white">Portfolio</h1>
        <p className="mt-2 text-slate-300">
          This page is now user-aware. Next step is storing holdings per user in Supabase. Your current profile favorite ticker is {profile?.favorite_ticker || 'not set'}.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-lg font-semibold text-white">Profile anchor</h2>
          <p className="mt-2 text-sm text-slate-300">{profile?.full_name || user.email}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-lg font-semibold text-white">Data model</h2>
          <p className="mt-2 text-sm text-slate-300">Use this page for per-user holdings, allocations, and saved screens once the tables are added.</p>
        </div>
      </div>
    </section>
  )
}

export default Portfolio
