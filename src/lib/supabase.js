import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// No keys in .env.local yet → the site runs on sample data ("demo mode") so it can still be looked at.
export const isDemo = !url || !key
export const supabase = isDemo ? null : createClient(url, key)
