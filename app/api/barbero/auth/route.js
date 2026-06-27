import crypto from 'crypto'

export async function POST(req) {
  const { password } = await req.json()

  if (password !== process.env.BARBERO_PASSWORD) {
    return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const timestamp = Date.now().toString()
  const payload = `${timestamp}:${password}`
  const signature = crypto.createHmac('sha256', password).update(payload).digest('hex')
  const token = `${timestamp}:${signature}`

  return Response.json({ token })
}

export async function GET(req) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!auth) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const [timestamp, signature] = auth.split(':')
  if (!timestamp || !signature) return Response.json({ error: 'Token inválido' }, { status: 401 })

  const age = Date.now() - parseInt(timestamp)
  if (age > 24 * 60 * 60 * 1000) return Response.json({ error: 'Token expirado' }, { status: 401 })

  const expected = crypto.createHmac('sha256', process.env.BARBERO_PASSWORD)
    .update(`${timestamp}:${process.env.BARBERO_PASSWORD}`)
    .digest('hex')

  if (signature !== expected) return Response.json({ error: 'Token inválido' }, { status: 401 })

  return Response.json({ valid: true })
}
