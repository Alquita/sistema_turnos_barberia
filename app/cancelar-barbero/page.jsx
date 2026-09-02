'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import styles from './cancelar-barbero.module.css'

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
      body: JSON.stringify({ token, origen: 'barbero' }),
    })
    const data = await res.json()

    if (!data.success) {
      setEstado('error')
      setMensaje(data.error || 'Ocurrió un error.')
      return
    }

    // El aviso al cliente lo manda /api/cancelar desde el servidor.
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