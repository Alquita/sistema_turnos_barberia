import crypto from 'crypto'

// Valida el token HMAC que emite POST /api/barbero/auth.
// Formato del token: "<timestamp>:<signature>", con o sin prefijo "Bearer ".
// La firma es HMAC-SHA256 de "<timestamp>:<BARBERO_PASSWORD>" con clave BARBERO_PASSWORD.
// Vence a las 24 horas.
export function verificarToken(auth) {
  if (!auth) return false
  const [timestamp, signature] = auth.replace('Bearer ', '').split(':')
  if (!timestamp || !signature) return false
  if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) return false
  const expected = crypto
    .createHmac('sha256', process.env.BARBERO_PASSWORD)
    .update(`${timestamp}:${process.env.BARBERO_PASSWORD}`)
    .digest('hex')
  return signature === expected
}
