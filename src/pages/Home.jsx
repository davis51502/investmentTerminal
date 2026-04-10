import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Home() {
  const { user, profile } = useAuth()

  return (
    <section className="space-y-10">
      <div className="mx-auto max-w-4xl py-10">
        <p className="text-[11px] uppercase tracking-[0.34em] text-slate-500">Investment Terminal</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          Markets, watchlists, and company discovery without the noise.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
          Search by company name, build a clean personal slate, and open ticker detail panels with price context and recent headlines when you need them.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/portfolio" className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950">
            Start building
          </Link>
          <Link to="/markets" className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-200">
            Browse markets
          </Link>
          <Link to={user ? '/settings' : '/auth'} className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-200">
            {user ? 'Profile' : 'Sign in'}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Search</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">Look up companies by name and add them directly from results instead of memorizing ticker symbols.</p>
        </article>
        <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Track</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">Keep a personal list of names you care about and let the app surface price movement in one place.</p>
        </article>
        <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Understand</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Open a ticker to see the chart and recent headlines together, with {user ? `${profile?.username || user.email}` : 'your account'} keeping the experience personal.
          </p>
        </article>
      </div>
    </section>
  )
}

export default Home
