'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import emailjs from '@emailjs/browser'
import styles from './cancelar-barbero.module.css'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const TEMPLATE_CLIENTE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CLIENTE
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

function CancelarBarberoContent() {
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

    // Avisar al cliente que el barbero canceló
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_CLIENTE, {
        nombre: data.turno.nombre,
        email_cliente: data.turno.email,
        servicio: data.turno.servicio,
        fecha: data.turno.fecha,
        hora: data.turno.hora,
        direccion: data.turno.direccion,
        cancel_link: '',
        maps_link: '',
        mensaje_cancelacion: '⚠️ Tu turno fue cancelado por el barbero.',
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
            <p className={styles.sub}>¿Confirmás que querés cancelar este turno? El cliente va a recibir un email avisándole automáticamente.</p>
            <button onClick={cancelar} className={styles.btnDanger}>Sí, cancelar turno</button>
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
            <p className={styles.sub}>El turno fue cancelado y el cliente fue notificado por email.</p>
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

export default function CancelarBarbero() {
  return (
    <Suspense>
      <CancelarBarberoContent />
    </Suspense>
  )
}