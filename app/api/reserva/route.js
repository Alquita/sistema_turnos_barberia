import { supabase } from '../../../lib/supabase'

const DURACIONES = {
  corte: 1, corte_barba: 1, barba: 1,
  globales: 3, mechas: 3, permanente: 3,
}

function getNowArgentina() {
  return new Date(Date.now() - 3 * 60 * 60 * 1000)
}

function esTurnoDeshabilitado(fecha, hora) {
  const ahora = getNowArgentina()
  const [h, m] = hora.split(':').map(Number)
  const turno = new Date(fecha + 'T00:00:00')
  turno.setHours(h, m, 0, 0)
  return (turno.getTime() - ahora.getTime()) < 30 * 60 * 1000
}

async function getHorariosParaFecha(fecha) {
  const { data } = await supabase
    .from('excepciones_horarios')
    .select('horarios')
    .eq('fecha', fecha)
    .single()
  if (data) return data.horarios

  const horariosTarde = ['16:00', '17:00', '18:00', '19:00', '20:00']
  const horariosMañana = ['08:00', '09:00', '10:00', '11:00']
  const dia = new Date(fecha + 'T00:00:00').getDay()
  if (dia === 6) return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00']
  if (dia === 2 || dia === 4) return [...horariosMañana, ...horariosTarde]
  return horariosTarde
}

async function calcularHorasBloqueadas(horaInicio, duracion, fecha) {
  const todos = await getHorariosParaFecha(fecha)
  const idx = todos.indexOf(horaInicio)
  if (idx === -1) return [horaInicio]
  return todos.slice(idx, idx + duracion)
}

export async function POST(req) {
  const body = await req.json()
  const { nombre, telefono, servicio, fecha, hora, direccion, email } = body

  if (!nombre || !telefono || !servicio || !fecha || !hora || !direccion || !email) {
    return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  if (esTurnoDeshabilitado(fecha, hora)) {
    return Response.json({ error: 'El horario seleccionado ya no está disponible.' }, { status: 400 })
  }

  const duracion = DURACIONES[servicio] || 1
  const horasARevisar = await calcularHorasBloqueadas(hora, duracion, fecha)

  const { data: existentes } = await supabase
    .from('turnos')
    .select('id')
    .eq('fecha', fecha)
    .in('hora', horasARevisar)
    .eq('cancelado', false)

  if (existentes && existentes.length > 0) {
    return Response.json({ error: 'Ese horario ya fue reservado. Elegí otro.' }, { status: 409 })
  }

  const { data: turno, error: sbError } = await supabase
    .from('turnos')
    .insert([{ nombre, telefono, servicio, fecha, hora, direccion, email }])
    .select()
    .single()

  if (sbError) return Response.json({ error: 'Error al guardar el turno' }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_URL
  const cancelLink = `${baseUrl}/cancelar?token=${turno.token_cancelacion}`
  const cancelLinkBarbero = `${baseUrl}/cancelar-barbero?token=${turno.token_cancelacion}`
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion + ', Río Cuarto, Córdoba')}`

  return Response.json({ 
    success: true, 
    token: turno.token_cancelacion,
    cancelLink,
    cancelLinkBarbero,
    mapsLink
  })
}