import { createClient } from '@supabase/supabase-js'

// Cliente SOLO para el servidor (route handlers en app/api).
// Usa la service_role key, que saltea RLS por completo.
// NUNCA importar esto desde un componente 'use client'.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
