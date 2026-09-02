import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { verificarToken } from '@/lib/barberoAuth'
import { avisarBarberoCancelacion, avisarClienteCancelacion } from '@/lib/emailCancelacion'

export async function POST(req) {
  const { token, origen } = await req.json()

  if (!token) {
    return Response.json({ error: 'Falta el token' }, { status: 400 })
  }

  // El barbero solo se considera autenticado si manda su token HMAC en el header.
  // El flag "esBarbero" del body ya NO alcanza para saltear el límite de 30 min.
  const barberoAutenticado = verificarToken(req.headers.get('authorization'))

  const { data: turno, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('token_cancelacion', token)
    .single()

  if (error || !turno) {
    return Response.json({ error: 'Turno no encontrado' }, { status: 404 })
  }
  if (turno.cancelado) {
    return Response.json({ error: 'El turno ya fue cancelado' }, { status: 400 })
  }

  // Límite de cancelación: hasta 30 minutos antes del turno.
  // Solo lo saltea el barbero autenticado con su token.
  if (!barberoAutenticado) {
    const [h, m] = turno.hora.slice(0, 5).split(':').map(Number)
    const fechaTurno = new Date(turno.fecha + 'T00:00:00')
    fechaTurno.setHours(h, m, 0, 0)
    const limite = new Date(fechaTurno.getTime() - 30 * 60 * 1000)

    if (Date.now() > limite.getTime()) {
      return Response.json({
        error: 'El período de cancelación venció. Faltan menos de 30 minutos para tu turno. Contactá al barbero directamente.',
      }, { status: 403 })
    }
  }

  const { error: updateError } = await supabase
    .from('turnos')
    .update({ cancelado: true })
    .eq('token_cancelacion', token)

  if (updateError) {
    return Response.json({ error: 'Error al cancelar el turno' }, { status: 500 })
  }

  // Aviso por email desde el servidor. Si falla, la cancelación igual queda hecha.
  try {
    if (origen === 'barbero') {
      await avisarClienteCancelacion(turno)
    } else {
      await avisarBarberoCancelacion(turno)
    }
  } catch (e) {
    console.error('Error al enviar el email de cancelación:', e)
  }

  return Response.json({ success: true })
}
