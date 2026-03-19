import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Settings() {
  const { user, profile, saveProfile, hasSupabaseConfig } = useAuth()
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState('')
  const form = draft || {
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    favorite_ticker: profile?.favorite_ticker || '',
  }

  if (!user) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-3 text-slate-300">Sign in to edit your profile and store settings in Supabase.</p>
        <Link to="/auth" className="mt-5 inline-flex rounded-xl bg-emerald-400 px-4 py-2.5 font-medium text-slate-950">
          Sign in
        </Link>
      </section>
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await saveProfile(form)
    setStatus(result.error || 'Profile saved.')
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-2 text-slate-300">
          Connected to Supabase profile storage. Add your env vars, then edit user metadata here.
        </p>
        {!hasSupabaseConfig && (
          <p className="mt-3 text-sm text-amber-200">Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-6 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Username</span>
          <input
            value={form.username}
            onChange={(event) => setDraft((prev) => ({ ...(prev || form), username: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Full name</span>
          <input
            value={form.full_name}
            onChange={(event) => setDraft((prev) => ({ ...(prev || form), full_name: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
          />
        </label>
        <label className="space-y-1 text-sm md:col-span-2">
          <span className="text-slate-300">Bio</span>
          <textarea
            value={form.bio}
            onChange={(event) => setDraft((prev) => ({ ...(prev || form), bio: event.target.value }))}
            rows="4"
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Favorite ticker</span>
          <input
            value={form.favorite_ticker}
            onChange={(event) => setDraft((prev) => ({ ...(prev || form), favorite_ticker: event.target.value.toUpperCase() }))}
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
          />
        </label>
        <div className="flex items-end">
          <button type="submit" className="rounded-xl bg-emerald-400 px-4 py-2.5 font-medium text-slate-950">
            Save profile
          </button>
        </div>
        {status && <p className="text-sm text-slate-300 md:col-span-2">{status}</p>}
      </form>
    </section>
  )
}

export default Settings
