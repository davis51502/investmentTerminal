import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

function AuthPanel() {
  const { signIn, signUp, error, hasSupabaseConfig, loading } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
  })
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')

    const result = mode === 'signin'
      ? await signIn(form.email, form.password)
      : await signUp({
          email: form.email,
          password: form.password,
          username: form.username,
          fullName: form.fullName,
        })

    if (result.error) {
      setStatus(result.error)
    } else {
      setStatus(mode === 'signin' ? 'Signed in.' : 'Account created. Check email if confirmation is enabled.')
    }

    setSubmitting(false)
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80">Account</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          {mode === 'signin' ? 'Sign in to your terminal' : 'Create your terminal profile'}
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Auth and profile storage run through Supabase. Each user gets their own profile and settings row.
        </p>
      </div>

      {!loading && !hasSupabaseConfig && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
          Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <>
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Username</span>
              <input
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none ring-0"
                placeholder="dwollesen"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Full name</span>
              <input
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none ring-0"
                placeholder="Davis Wollesen"
              />
            </label>
          </>
        )}

        <label className="block space-y-1 text-sm">
          <span className="text-slate-300">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none ring-0"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-slate-300">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none ring-0"
            placeholder="Minimum 6 characters"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
        >
          {submitting ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      {(status || error) && (
        <p className="mt-4 text-sm text-slate-200">{status || error}</p>
      )}

      <button
        type="button"
        onClick={() => setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))}
        className="mt-4 text-sm text-emerald-300 hover:text-emerald-200"
      >
        {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
      </button>
    </section>
  )
}

export default AuthPanel
