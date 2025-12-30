import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cxoldiyxjjuicmfrsqmn.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4b2xkaXl4amp1aWNtZnJzcW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MTU1NzgsImV4cCI6MjA4MjM5MTU3OH0.NeSe2_REm1Q9FbgRcBiam3d8KpMOtfU2PfifGfIKgRQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
