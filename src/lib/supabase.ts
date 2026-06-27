import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const SUPABASE_URL = url ?? ''
export const SUPABASE_ANON_KEY = anonKey ?? ''
export const SUPABASE_ENABLED = Boolean(url && anonKey)

// Lazily import supabase-js so it stays in its own chunk and is never loaded
// when the app runs purely on cached/dummy data.
let clientPromise: Promise<SupabaseClient> | null = null

export function getSupabase(): Promise<SupabaseClient> {
  if (!SUPABASE_ENABLED) {
    return Promise.reject(new Error('Supabase no configurado'))
  }
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url!, anonKey!, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    )
  }
  return clientPromise
}

export const STORAGE_BUCKET = 'fotos'
