'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import emailjs from '@emailjs/browser'
import styles from './cancelar.module.css'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

function CancelarContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const [estado, setEstado] = useState('confirm')
  const [mensaje, setMensaje] = useState('')

  const cancelar = async () => {
    setEstado('loading')
    const res = await fetch('/api/cancelar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()

    if (!data.success) {
      setEstado('error')
      setMensaje(data.error || 'Ocurrió un error.')
      return
    }

    // Mandar email al barbero avisando la cancelación
    try {
      await emailjs.send(SERVICE_ID, 'template_hdise3m', {
        subject_override: `❌ Turno cancelado — ${data.turno.nombre} — ${data.turno.fecha} ${data.turno.hora}hs`,
        nombre: data.turno.nombre,
        fecha: data.turno.fecha,
        hora: data.turno.hora,
        direccion: data.turno.direccion,
        telefono: data.turno.telefono,
        email_cliente: data.turno.email,
        servicio: data.turno.servicio,
        maps_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.turno.direccion + ', Río Cuarto, Córdoba')}`,
        cancel_link: '',
        mensaje_extra: '⚠️ Este cliente CANCELÓ su turno. El horario quedó libre nuevamente.',
      }, PUBLIC_KEY)
    } catch (e) {
      console.error('Email error:', e)
    }

    setEstado('success')
  }

  if (!token) return (
    <div className={styles.wrap}>
      <p className={styles.errorTxt}>Link inválido.</p>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {estado === 'confirm' && (
          <>
            <div className={styles.icon}>⚠️</div>
            <h2 className={styles.title}>Cancelar turno</h2>
            <p className={styles.sub}>¿Estás seguro que querés cancelar tu turno? Esta acción no se puede deshacer y el horario quedará disponible para otros clientes.</p>
            <button onClick={cancelar} className={styles.btnDanger}>Sí, cancelar mi turno</button>
          </>
        )}
        {estado === 'loading' && (
          <>
            <div className={styles.icon}>⏳</div>
            <h2 className={styles.title}>Cancelando...</h2>
          </>
        )}
        {estado === 'success' && (
          <>
            <div className={styles.icon}>✅</div>
            <h2 className={styles.title}>Turno cancelado</h2>
            <p className={styles.sub}>Tu turno fue cancelado correctamente. Uri fue notificado por email. Si querés reservar otro turno, podés hacerlo desde la página.</p>
            <button onClick={() => window.location.href = '/turno'} className={styles.btnPrimary}>
              Reservar nuevo turno
            </button>
          </>
        )}
        {estado === 'error' && (
          <>
            <div className={styles.icon}>❌</div>
            <h2 className={styles.title}>Error</h2>
            <p className={styles.sub}>{mensaje}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function Cancelar() {
  return (
    <Suspense>
      <CancelarContent />
    </Suspense>
  )
}