import { createClient } from "@supabase/supabase-js"

// نستخدم علامة التعجب (!) لإخبار TypeScript أن هذه القيم موجودة بالتأكيد في إعدادات Netlify
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)