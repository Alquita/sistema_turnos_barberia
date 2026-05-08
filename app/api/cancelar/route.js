import { supabase } from '../../../lib/supabase'

function parseUTC(dateStr) {
  if (!dateStr) return new Date()
  return new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z')
}

export async function POST(req) {
  const { token, esBarbero } = await req.json()

  const { data: turno, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('token_cancelacion', token)
    .single()

  if (error || !turno) return Response.json({ error: 'Turno no encontrado' }, { status: 404 })
  if (turno.cancelado) return Response.json({ error: 'El turno ya fue cancelado' }, { status: 400 })

  if (!esBarbero) {
    const createdAt = parseUTC(turno.created_at)
    const transcurridoMs = Date.now() - createdAt.getTime()
    const diffMinutos = transcurridoMs / 60000
    if (diffMinutos > 30) {
      return Response.json({ 
        error: 'El período de cancelación de 30 minutos ya venció. Si necesitás cancelar, contactá al barbero directamente.' 
      }, { status: 403 })
    }
  }

  await supabase.from('turnos').update({ cancelado: true }).eq('token_cancelacion', token)

  return Response.json({ success: true, turno })
}