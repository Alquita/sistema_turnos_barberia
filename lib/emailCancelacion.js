// Envío de los emails de cancelación desde el servidor, vía la API REST de EmailJS.
// Antes se mandaban desde el browser y para eso la respuesta de /api/cancelar tenía
// que devolver todos los datos del turno (nombre, teléfono, email, dirección).
// Ahora el browser no recibe esos datos.

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send'

const SERVICIOS_NOMBRE = {
  corte: 'Corte de pelo',
  corte_barba: 'Corte + Barba',
  barba: 'Solo Barba',
  globales: 'Globales',
  mechas: 'Mechas',
  permanente: 'Permanente',
}

function nombreServicio(servicio) {
  return SERVICIOS_NOMBRE[servicio] || servicio
}

function mapsLink(direccion) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion + ', Río Cuarto, Córdoba')}`
}

async function enviar(templateId, templateParams) {
  const res = await fetch(EMAILJS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: templateParams,
    }),
  })
  if (!res.ok) {
    const detalle = await res.text().catch(() => '')
    throw new Error(`EmailJS ${res.status}: ${detalle}`)
  }
}

// Un cliente canceló su turno -> avisar al barbero.
// Mismo template que la confirmación de turno nuevo; se distingue por mensaje_extra.
export async function avisarBarberoCancelacion(turno) {
  await enviar(process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_BARBERO, {
    nombre: turno.nombre,
    fecha: turno.fecha,
    hora: turno.hora,
    direccion: turno.direccion,
    telefono: turno.telefono,
    email_cliente: turno.email,
    servicio: nombreServicio(turno.servicio),
    maps_link: mapsLink(turno.direccion),
    cancel_link: '',
    cancel_link_barbero: '',
    mensaje_extra: '⚠️ Este cliente CANCELÓ su turno. El horario quedó libre nuevamente.',
  })
}

// El barbero canceló un turno -> avisar al cliente.
export async function avisarClienteCancelacion(turno) {
  await enviar(process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CLIENTE, {
    nombre: turno.nombre,
    email_cliente: turno.email,
    servicio: nombreServicio(turno.servicio),
    fecha: turno.fecha,
    hora: turno.hora,
    direccion: turno.direccion,
    cancel_link: '',
    maps_link: '',
    mensaje_cancelacion: '⚠️ Tu turno fue cancelado por el barbero.',
  })
}
