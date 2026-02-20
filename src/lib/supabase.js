import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '⚠️ Supabase credentials not found. Running in demo mode.\n' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

// Helper: check if running with real Supabase
export const isSupabaseConfigured = () => Boolean(supabase)

// Generic error handler
export const handleSupabaseError = (error, context = '') => {
  console.error(`[Supabase${context ? ` - ${context}` : ''}]`, error)
  return { error: error.message || 'Erro inesperado' }
}

export default supabase
