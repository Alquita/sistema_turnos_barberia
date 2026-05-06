import { supabase } from '../../../lib/supabase'

export async function POST(req) {
  const body = await req.json()
  const { nombre, telefono, servicio, fecha, hora, direccion, email } = body

  const { data: turno, error: sbError } = await supabase
    .from('turnos')
    .insert([{ nombre, telefono, servicio, fecha, hora, direccion, email }])
    .select()
    .single()

  if (sbError) return Response.json({ error: 'Error al guardar el turno' }, { status: 500 })

  const cancelLink = `${process.env.NEXT_PUBLIC_URL}/cancelar?token=${turno.token_cancelacion}`
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion + ', Río Cuarto, Córdoba')}`

  return Response.json({ 
    success: true, 
    token: turno.token_cancelacion,
    cancelLink,
    mapsLink
  })
}