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
    // Construir la fecha/hora del turno
    const [h, m] = turno.hora.slice(0, 5).split(':').map(Number)
    const fechaTurno = new Date(turno.fecha + 'T00:00:00')
    fechaTurno.setHours(h, m, 0, 0)

    // Límite = 30 minutos antes del turno
    const limite = new Date(fechaTurno.getTime() - 30 * 60 * 1000)

    if (Date.now() > limite.getTime()) {
      return Response.json({ 
        error: 'El período de cancelación venció. Faltan menos de 30 minutos para tu turno. Contactá al barbero directamente.' 
      }, { status: 403 })
    }
  }

  await supabase.from('turnos').update({ cancelado: true }).eq('token_cancelacion', token)

  return Response.json({ success: true, turno })
}