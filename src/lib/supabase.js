import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if using placeholder values
const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

if (!isConfigured) {
    console.warn('⚠️ Supabase not configured! Using placeholder values.')
    console.warn('📝 To enable authentication, create a .env.local file with:')
    console.warn('   VITE_SUPABASE_URL=your-project-url')
    console.warn('   VITE_SUPABASE_ANON_KEY=your-anon-key')
    console.warn('👉 See .env.example for the template')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = isConfigured
