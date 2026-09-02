import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  const { data: turno, error } = await supabase
    .from('turnos')
    .select('nombre, fecha, hora, cancelado, created_at')
    .eq('token_cancelacion', token)
    .single()

  if (error || !turno) return Response.json({ error: 'No encontrado' }, { status: 404 })

  return Response.json({ turno })
}