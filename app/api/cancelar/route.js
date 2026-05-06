import { supabase } from '../../../lib/supabase'

export async function POST(req) {
  const { token } = await req.json()

  const { data: turno, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('token_cancelacion', token)
    .single()

  if (error || !turno) return Response.json({ error: 'Turno no encontrado' }, { status: 404 })
  if (turno.cancelado) return Response.json({ error: 'El turno ya fue cancelado' }, { status: 400 })

  await supabase.from('turnos').update({ cancelado: true }).eq('token_cancelacion', token)

  return Response.json({ success: true, turno })
}