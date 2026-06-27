import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

function verificarToken(auth) {
  if (!auth) return false
  const [timestamp, signature] = auth.replace('Bearer ', '').split(':')
  if (!timestamp || !signature) return false
  if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) return false
  const expected = crypto.createHmac('sha256', process.env.BARBERO_PASSWORD)
    .update(`${timestamp}:${process.env.BARBERO_PASSWORD}`)
    .digest('hex')
  return signature === expected
}

export async function GET(req) {
  if (!verificarToken(req.headers.get('authorization'))) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ahora = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const fechaStr = ahora.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .gte('fecha', fechaStr)
    .eq('cancelado', false)
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })

  if (error) return Response.json({ error: 'Error al obtener turnos' }, { status: 500 })

  return Response.json({ turnos: data })
}

export async function POST(req) {
  if (!verificarToken(req.headers.get('authorization'))) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { nombre, telefono, email, servicio, fecha, hora, direccion } = await req.json()
  if (!nombre || !telefono || !email || !servicio || !fecha || !hora || !direccion) {
    return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data: turno, error } = await supabase
    .from('turnos')
    .insert([{ nombre, telefono, email, servicio, fecha, hora, direccion }])
    .select()
    .single()

  if (error) return Response.json({ error: 'Error al crear el turno' }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_URL
  const cancelLink = `${baseUrl}/cancelar?token=${turno.token_cancelacion}`
  const cancelLinkBarbero = `${baseUrl}/cancelar-barbero?token=${turno.token_cancelacion}`
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion + ', Río Cuarto, Córdoba')}`

  return Response.json({ success: true, turno, cancelLink, cancelLinkBarbero, mapsLink })
}

export async function PUT(req) {
  if (!verificarToken(req.headers.get('authorization'))) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id, fecha, hora } = await req.json()
  if (!id || !fecha || !hora) {
    return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data: turno, error } = await supabase
    .from('turnos')
    .update({ fecha, hora })
    .eq('id', id)
    .eq('cancelado', false)
    .select()
    .single()

  if (error || !turno) {
    return Response.json({ error: 'Error al actualizar el turno' }, { status: 500 })
  }

  return Response.json({ success: true, turno })
}
