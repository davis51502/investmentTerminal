import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient(supabaseUrl, supabaseAnonKey) {
  if (!supabaseUrl || !supabaseAnonKey) return null

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

export async function fetchSupabaseConfig() {
  const response = await fetch('/api/config')
  if (!response.ok) {
    return { url: '', anonKey: '', configured: false }
  }

  const payload = await response.json()
  return payload.supabase || { url: '', anonKey: '', configured: false }
}
