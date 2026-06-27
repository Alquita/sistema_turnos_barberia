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

  const { data, error } = await supabase
    .from('excepciones_horarios')
    .select('*')
    .order('fecha', { ascending: true })

  if (error) return Response.json({ error: 'Error al obtener excepciones' }, { status: 500 })

  return Response.json({ excepciones: data })
}

export async function POST(req) {
  if (!verificarToken(req.headers.get('authorization'))) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { fecha, horarios } = await req.json()
  if (!fecha || !horarios) {
    return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data: existente } = await supabase
    .from('excepciones_horarios')
    .select('id')
    .eq('fecha', fecha)
    .single()

  let result
  if (existente) {
    result = await supabase
      .from('excepciones_horarios')
      .update({ horarios })
      .eq('id', existente.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('excepciones_horarios')
      .insert({ fecha, horarios })
      .select()
      .single()
  }

  if (result.error) return Response.json({ error: 'Error al guardar' }, { status: 500 })

  return Response.json({ success: true, excepcion: result.data })
}

export async function DELETE(req) {
  if (!verificarToken(req.headers.get('authorization'))) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await req.json()
  if (!id) return Response.json({ error: 'Falta id' }, { status: 400 })

  const { error } = await supabase.from('excepciones_horarios').delete().eq('id', id)

  if (error) return Response.json({ error: 'Error al eliminar' }, { status: 500 })

  return Response.json({ success: true })
}
