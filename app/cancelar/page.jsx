'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import emailjs from '@emailjs/browser'
import styles from './cancelar.module.css'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

function parseUTC(dateStr) {
  if (!dateStr) return new Date()
  return new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z')
}

function CancelarContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const [estado, setEstado] = useState('loading')
  const [mensaje, setMensaje] = useState('')
  const [turnoData, setTurnoData] = useState(null)
  const [tiempoRestante, setTiempoRestante] = useState(null)
  const [puedeCancelar, setPuedeCancelar] = useState(false)

  useEffect(() => {
    if (!token) { setEstado('invalid'); return }
    const fetchTurno = async () => {
      try {
        const res = await fetch(`/api/turno-info?token=${token}`)
        if (!res.ok) { setEstado('invalid'); return }
        const data = await res.json()
        if (!data.turno) { setEstado('invalid'); return }
        if (data.turno.cancelado) { setEstado('ya_cancelado'); return }
        setTurnoData(data.turno)
        setEstado('confirm')
      } catch (e) {
        setEstado('invalid')
      }
    }
    fetchTurno()
  }, [token])

  useEffect(() => {
    if (!turnoData) return
    const calcular = () => {
      // Construir la fecha/hora del turno
      const [h, m] = turnoData.hora.slice(0, 5).split(':').map(Number)
      const fechaTurno = new Date(turnoData.fecha + 'T00:00:00')
      fechaTurno.setHours(h, m, 0, 0)

      // Límite = 30 minutos antes del turno
      const limite = new Date(fechaTurno.getTime() - 30 * 60 * 1000)
      const restanteMs = limite.getTime() - Date.now()

      if (restanteMs <= 0) {
        setTiempoRestante({ mins: 0, segs: 0, porcentaje: 0 })
        setPuedeCancelar(false)
      } else {
        const mins = Math.floor(restanteMs / 60000)
        const segs = Math.floor((restanteMs % 60000) / 1000)
        // Para el porcentaje usamos el tiempo total desde creación hasta límite
        const createdAt = parseUTC(turnoData.created_at)
        const totalMs = limite.getTime() - createdAt.getTime()
        const porcentaje = Math.min(100, (restanteMs / totalMs) * 100)
        setTiempoRestante({ mins, segs, porcentaje })
        setPuedeCancelar(true)
      }
    }
    calcular()
    const interval = setInterval(calcular, 1000)
    return () => clearInterval(interval)
  }, [turnoData])

  const cancelar = async () => {
    setEstado('loading_cancel')
    const res = await fetch('/api/cancelar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, esBarbero: false }),
    })
    const data = await res.json()
    if (!data.success) {
      setEstado('error')
      setMensaje(data.error)
      return
    }
    try {
      await emailjs.send(SERVICE_ID, 'template_hdise3m', {
        nombre: data.turno.nombre,
        fecha: data.turno.fecha,
        hora: data.turno.hora,
        direccion: data.turno.direccion,
        telefono: data.turno.telefono,
        email_cliente: data.turno.email,
        servicio: data.turno.servicio,
        maps_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.turno.direccion + ', Río Cuarto, Córdoba')}`,
        cancel_link: '',
        cancel_link_barbero: '',
        mensaje_extra: '⚠️ Este cliente CANCELÓ su turno. El horario quedó libre nuevamente.',
      }, PUBLIC_KEY)
    } catch (e) {
      console.error('Email error:', e)
    }
    setEstado('success')
  }

  if (!token || estado === 'invalid') return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>❌</div>
        <h2 className={styles.title}>Link inválido</h2>
        <p className={styles.sub}>Este link de cancelación no es válido.</p>
      </div>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>

        {estado === 'loading' && (
          <>
            <div className={styles.icon}>⏳</div>
            <h2 className={styles.title}>Cargando...</h2>
          </>
        )}

        {estado === 'ya_cancelado' && (
          <>
            <div className={styles.icon}>ℹ️</div>
            <h2 className={styles.title}>Turno ya cancelado</h2>
            <p className={styles.sub}>Este turno ya fue cancelado anteriormente.</p>
          </>
        )}

        {estado === 'confirm' && (
          <>
            <div className={styles.icon}>⚠️</div>
            <h2 className={styles.title}>Cancelar turno</h2>
            <p className={styles.sub}>¿Estás seguro que querés cancelar? Esta acción no se puede deshacer.</p>

            {tiempoRestante !== null && (
              puedeCancelar ? (
                <div className={styles.timerOk}>
                  <div className={styles.timerLabel}>⏱ Tiempo para cancelar</div>
                  <div className={styles.timerClock}>
                    {String(Math.floor(tiempoRestante.mins / 60)).padStart(2, '0')}h{' '}
                    {String(tiempoRestante.mins % 60).padStart(2, '0')}m{' '}
                    {String(tiempoRestante.segs).padStart(2, '0')}s
                  </div>
                  <div className={styles.timerBar}>
                    <div className={styles.timerBarFill}
                      style={{ width: `${tiempoRestante.porcentaje}%` }} />
                  </div>
                  <div className={styles.timerSub}>podés cancelar hasta 30 min antes de tu turno</div>
                </div>
              ) : (
                <div className={styles.timerVencido}>
                  <div className={styles.timerClockRed}>00:00</div>
                  <p style={{ margin: '8px 0 0', fontSize: 13 }}>⛔ Faltan menos de 30 minutos para tu turno. Contactá al barbero para cancelar.</p>
                </div>
              )
            )}

            <button
              onClick={cancelar}
              disabled={!puedeCancelar}
              className={`${styles.btnDanger} ${!puedeCancelar ? styles.btnDisabled : ''}`}>
              Sí, cancelar mi turno
            </button>
          </>
        )}

        {estado === 'loading_cancel' && (
          <>
            <div className={styles.icon}>⏳</div>
            <h2 className={styles.title}>Cancelando...</h2>
          </>
        )}

        {estado === 'success' && (
          <>
            <div className={styles.icon}>✅</div>
            <h2 className={styles.title}>Turno cancelado</h2>
            <p className={styles.sub}>Tu turno fue cancelado. Uri fue notificado por email.</p>
            <button onClick={() => window.location.href = '/turno'} className={styles.btnPrimary}>
              Reservar nuevo turno
            </button>
          </>
        )}

        {estado === 'error' && (
          <>
            <div className={styles.icon}>❌</div>
            <h2 className={styles.title}>No se puede cancelar</h2>
            <p className={styles.sub}>{mensaje}</p>
            <a href="https://wa.me/5493546544752" target="_blank" rel="noopener noreferrer" className={styles.btnWa}>
              💬 Contactar al barbero
            </a>
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