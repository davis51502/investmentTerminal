import { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseClient, fetchSupabaseConfig } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [supabase, setSupabase] = useState(null)
  const [hasSupabaseConfig, setHasSupabaseConfig] = useState(false)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProfile(client, userId, active = true) {
    if (!client) return null
    const { data, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!active) return null

    if (profileError) {
      setError(profileError.message)
      return null
    }

    setProfile(data)
    return data
  }

  useEffect(() => {
    let active = true
    let subscription = null

    async function bootstrap() {
      const config = await fetchSupabaseConfig().catch(() => ({ url: '', anonKey: '', configured: false }))
      if (!active) return

      setHasSupabaseConfig(Boolean(config.configured))

      const client = createSupabaseClient(config.url, config.anonKey)
      setSupabase(client)

      if (!client) {
        setLoading(false)
        return
      }

      const { data, error: sessionError } = await client.auth.getSession()
      if (!active) return
      if (sessionError) setError(sessionError.message)
      setSession(data.session)
      if (data.session?.user) {
        await loadProfile(client, data.session.user.id, active)
      }
      setLoading(false)

      const { data: listener } = client.auth.onAuthStateChange(async (_event, nextSession) => {
        if (!active) return
        setSession(nextSession)
        setError('')
        if (nextSession?.user) {
          await loadProfile(client, nextSession.user.id, active)
        } else {
          setProfile(null)
        }
        setLoading(false)
      })

      subscription = listener.subscription
    }

    bootstrap()

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    if (!supabase) {
      setError('Supabase env vars are missing.')
      return { error: 'Missing Supabase config' }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      return { error: signInError.message }
    }

    return { error: null }
  }

  async function signUp({ email, password, username, fullName }) {
    if (!supabase) {
      setError('Supabase env vars are missing.')
      return { error: 'Missing Supabase config' }
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      return { error: signUpError.message }
    }

    const userId = data.user?.id
    if (userId) {
      await upsertProfile({
        id: userId,
        username,
        full_name: fullName,
        favorite_ticker: 'AAPL',
      })
    }

    return { error: null }
  }

  async function upsertProfile(nextProfile) {
    const userId = nextProfile.id || session?.user?.id

    if (!supabase || !userId) {
      return { error: 'Missing authenticated user' }
    }

    const payload = {
      id: userId,
      username: nextProfile.username || '',
      full_name: nextProfile.full_name || '',
      bio: nextProfile.bio || '',
      favorite_ticker: nextProfile.favorite_ticker || '',
      updated_at: new Date().toISOString(),
    }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single()

    if (profileError) {
      setError(profileError.message)
      return { error: profileError.message }
    }

    setProfile(data)
    return { error: null, data }
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setProfile(null)
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    error,
    hasSupabaseConfig,
    signIn,
    signUp,
    signOut,
    refreshProfile: () => (session?.user?.id ? loadProfile(supabase, session.user.id) : Promise.resolve(null)),
    saveProfile: upsertProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}
