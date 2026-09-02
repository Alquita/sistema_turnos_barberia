import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

// Devuelve los turnos ocupados de una fecha para que la página pública pueda
// marcar los horarios que ya no están disponibles.
// Solo expone `hora` y `servicio`: nunca datos personales de otros clientes.
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const fecha = searchParams.get('fecha')

  if (!fecha) {
    return Response.json({ error: 'Falta la fecha' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('turnos')
    .select('hora, servicio')
    .eq('fecha', fecha)
    .eq('cancelado', false)

  if (error) {
    return Response.json({ error: 'Error al consultar disponibilidad' }, { status: 500 })
  }

  return Response.json({ ocupados: data || [] })
}
