import { createClient } from '@supabase/supabase-js'
import { apiUrl } from './api.js'

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
  let lastError = null

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(apiUrl('/api/config'))
      if (response.ok) {
        const payload = await response.json()
        return payload.supabase || { url: '', anonKey: '', configured: false }
      }
      lastError = new Error(`Config request failed with ${response.status}`)
    } catch (error) {
      lastError = error
    }

    await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)))
  }

  if (lastError) {
    console.warn('Unable to load Supabase config from backend.', lastError)
  }

  return { url: '', anonKey: '', configured: false }
}
