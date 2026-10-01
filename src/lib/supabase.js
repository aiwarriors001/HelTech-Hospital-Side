import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://blzvfmitohvjlbrodpec.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsenZmbWl0b2h2amxicm9kcGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTU4NTgsImV4cCI6MjA4MjU5MTg1OH0.eF4QVxvfQ5n1-f0AFo8Nqa-9g8sWYNPk3s36uFTXYek'

export const isConfigured = !!(supabaseUrl && supabaseAnonKey)
export const isSupabaseConfigured = isConfigured

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase
