'use client'

import { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import styles from './turno.module.css'

const SERVICIOS = [
  { id: 'corte', nombre: 'Corte de pelo', precio: '$16.000' },
  { id: 'corte_barba', nombre: 'Corte + Barba', precio: '$25.000' },
  { id: 'barba', nombre: 'Solo Barba', precio: '$11.000' },
]

const PAISES = [
  { codigo: '🇦🇷 +54 9', valor: '549', placeholder: '3584001234', largo: 10 },
  { codigo: '🇺🇾 +598', valor: '598', placeholder: '91234567', largo: 8 },
  { codigo: '🇧🇴 +591', valor: '591', placeholder: '71234567', largo: 8 },
  { codigo: '🇨🇱 +56', valor: '56', placeholder: '912345678', largo: 9 },
  { codigo: '🇵🇾 +595', valor: '595', placeholder: '981234567', largo: 9 },
  { codigo: '🇧🇷 +55', valor: '55', placeholder: '11912345678', largo: 11 },
  { codigo: '🇪🇸 +34', valor: '34', placeholder: '612345678', largo: 9 },
]

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const TEMPLATE_BARBERO = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_BARBERO
const TEMPLATE_CLIENTE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CLIENTE
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

// Hora actual en Argentina (UTC-3), actualizada cada minuto
function getNowArgentina() {
  const now = new Date()
  // Convertir a UTC-3
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc - 3 * 60 * 60 * 1000)
}

function esTurnoDeshabilitado(fechaTurno, horaTurno) {
  const ahora = getNowArgentina()
  const [h, m] = horaTurno.split(':').map(Number)
  const turno = new Date(fechaTurno + 'T00:00:00')
  turno.setHours(h, m, 0, 0)

  // Deshabilitar si faltan menos de 30 minutos o ya pasó
  const diffMs = turno.getTime() - ahora.getTime()
  return diffMs < 30 * 60 * 1000
}

function getFechasDisponibles() {
  const fechas = []
  const ahora = getNowArgentina()
  for (let i = 0; i < 14; i++) {
    const d = new Date(ahora)
    d.setDate(ahora.getDate() + i)
    const dia = d.getDay()
    if (dia >= 2 && dia <= 6) {
      const fecha = d.toISOString().split('T')[0]
      // Verificar que el día tenga al menos un horario disponible
      const horarios = getHorariosParaDia(fecha)
      const hayDisponibles = horarios.some(h => !esTurnoDeshabilitado(fecha, h))
      if (hayDisponibles) fechas.push(fecha)
    }
  }
  return fechas
}

function getHorariosParaDia(fecha) {
  if (!fecha) return []
  const dia = new Date(fecha + 'T00:00:00').getDay()
  const esDiaHabil = dia >= 2 && dia <= 6
  if (!esDiaHabil) return []
  const horariosTarde = ['16:00', '17:00', '18:00', '19:00', '20:00']
  const horariosMañana = ['08:00', '09:00', '10:00', '11:00']
  if (dia === 2 || dia === 4) return [...horariosMañana, ...horariosTarde]
  return horariosTarde
}

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export default function Turno() {
  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '', servicio: '', fecha: '', hora: '', direccion: ''
  })
  const [paisSeleccionado, setPaisSeleccionado] = useState(PAISES[0])
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [horariosOcupados, setHorariosOcupados] = useState([])
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [ahora, setAhora] = useState(getNowArgentina())

  // Actualizar el reloj cada 30 segundos para recalcular horarios
  useEffect(() => {
    const interval = setInterval(() => {
      setAhora(getNowArgentina())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const fechas = getFechasDisponibles()
  const horarios = getHorariosParaDia(form.fecha)

  useEffect(() => {
    if (!form.fecha) return
    const fetchOcupados = async () => {
      const { data } = await supabase
        .from('turnos')
        .select('hora')
        .eq('fecha', form.fecha)
        .eq('cancelado', false)
      setHorariosOcupados(data ? data.map(t => t.hora.slice(0, 5)) : [])
    }
    fetchOcupados()
  }, [form.fecha])

  // Si el horario seleccionado se vuelve inválido por el tiempo, limpiarlo
  useEffect(() => {
    if (form.hora && form.fecha && esTurnoDeshabilitado(form.fecha, form.hora)) {
      setForm(prev => ({ ...prev, hora: '' }))
      toast.error('El horario seleccionado ya no está disponible.')
    }
  }, [ahora])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nombre.trim()) return toast.error('Ingresá tu nombre completo')
    if (!form.telefono.trim()) return toast.error('Ingresá tu teléfono')
    if (!form.email.trim()) return toast.error('Ingresá tu email')
    if (!form.servicio) return toast.error('Elegí un servicio')
    if (!form.fecha) return toast.error('Seleccioná una fecha')
    if (!form.hora) return toast.error('Seleccioná un horario')
    if (!form.direccion.trim()) return toast.error('Ingresá tu dirección')
    if (!aceptaTerminos) return toast.error('Debés aceptar los términos para continuar')

    // Verificación final de tiempo
    if (esTurnoDeshabilitado(form.fecha, form.hora)) {
      toast.error('Este horario ya no está disponible. Elegí otro.')
      setForm(prev => ({ ...prev, hora: '' }))
      return
    }

    setCargando(true)

    const { data: yaReservado } = await supabase
      .from('turnos')
      .select('id')
      .eq('fecha', form.fecha)
      .eq('hora', form.hora)
      .eq('cancelado', false)

    if (yaReservado && yaReservado.length > 0) {
      toast.error('Ese turno ya fue reservado. Elegí otro horario.')
      setHorariosOcupados(prev => [...prev, form.hora])
      setForm(prev => ({ ...prev, hora: '' }))
      setCargando(false)
      return
    }

    const telefonoCompleto = `${paisSeleccionado.valor}${form.telefono}`

    const res = await fetch('/api/reserva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, telefono: telefonoCompleto }),
    })
    const data = await res.json()

    if (!data.success) {
      toast.error('Hubo un error al guardar. Intentá de nuevo.')
      setCargando(false)
      return
    }

    const servicioNombre = SERVICIOS.find(s => s.id === form.servicio)?.nombre || form.servicio

    const templateParams = {
      nombre: form.nombre,
      telefono: telefonoCompleto,
      email_cliente: form.email,
      servicio: servicioNombre,
      fecha: form.fecha,
      hora: form.hora,
      direccion: form.direccion,
      maps_link: data.mapsLink,
      cancel_link: data.cancelLink,
      cancel_link_barbero: data.cancelLinkBarbero,
      mensaje_extra: '',
    }

    try {
      await toast.promise(
        Promise.all([
          emailjs.send(SERVICE_ID, TEMPLATE_BARBERO, templateParams, PUBLIC_KEY),
          emailjs.send(SERVICE_ID, TEMPLATE_CLIENTE, templateParams, PUBLIC_KEY),
        ]),
        {
          loading: '✉ Enviando confirmación por email...',
          success: '¡Emails enviados! Revisá tu bandeja.',
          error: 'El turno se guardó pero hubo un error al enviar el email.',
        }
      )
    } catch (err) {
      console.error('EmailJS error:', err)
    }

    setEnviado(true)
    setCargando(false)
  }

  const resetForm = () => {
    setEnviado(false)
    setAceptaTerminos(false)
    setForm({ nombre: '', telefono: '', email: '', servicio: '', fecha: '', hora: '', direccion: '' })
    setHorariosOcupados([])
  }

  if (enviado) return (
    <div className={styles.successWrap}>
      <div className={styles.successCard}>
        <div className={styles.checkCircle}>✓</div>
        <h2 className={styles.successTitle}>¡Turno confirmado!</h2>
        <p className={styles.successSub}>Te enviamos un email de confirmación con todos los detalles. Revisá tu bandeja de entrada.</p>
        <button onClick={resetForm} className={styles.btnSecondary}>Reservar otro turno</button>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>✂ Nuevo turno</span>
          <h1 className={styles.title}>Reservá tu turno</h1>
          <p className={styles.sub}>Martes a Sábados · Río Cuarto</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre completo</label>
              <input name="nombre" value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                placeholder="Juan García" className={styles.input} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Teléfono / WhatsApp</label>
              <div className={styles.telefonoWrap}>
                <select
                  className={styles.paisSelect}
                  value={paisSeleccionado.valor}
                  onChange={e => {
                    const p = PAISES.find(p => p.valor === e.target.value)
                    setPaisSeleccionado(p)
                    setForm({...form, telefono: ''})
                  }}>
                  {PAISES.map(p => (
                    <option key={p.valor} value={p.valor}>{p.codigo}</option>
                  ))}
                </select>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, paisSeleccionado.largo)
                    setForm({...form, telefono: val})
                  }}
                  placeholder={paisSeleccionado.placeholder}
                  className={styles.telefonoInput}
                  inputMode="numeric"
                />
              </div>
              <span className={styles.hint}>Sin el 0 ni el 15. Ej: {paisSeleccionado.placeholder}</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input type="email" name="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="tucorreo@gmail.com" className={styles.input} />
            <span className={styles.hint}>Te enviamos la confirmación y el link para cancelar a este correo.</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Servicio</label>
            <select name="servicio" value={form.servicio}
              onChange={e => setForm({...form, servicio: e.target.value})}
              className={styles.select}>
              <option value="">Elegí un servicio</option>
              {SERVICIOS.map(s => (
                <option key={s.id} value={s.id}>{s.nombre} — {s.precio}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Fecha</label>
            <div className={styles.fechasGrid}>
              {fechas.map(f => {
                const d = new Date(f + 'T00:00:00')
                return (
                  <button type="button" key={f}
                    onClick={() => setForm({...form, fecha: f, hora: ''})}
                    className={`${styles.fechaBtn} ${form.fecha === f ? styles.fechaBtnActive : ''}`}>
                    <span className={styles.fechaDia}>{DIAS_ES[d.getDay()]}</span>
                    <span className={styles.fechaNum}>{d.getDate()}</span>
                    <span className={styles.fechaMes}>{MESES_ES[d.getMonth()]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {form.fecha && (
            <div className={styles.field}>
              <label className={styles.label}>Horario</label>
              {horarios.length === 0 ? (
                <p className={styles.hint}>No hay turnos disponibles este día.</p>
              ) : (
                <div className={styles.horariosGrid}>
                  {horarios.map(h => {
                    const ocupado = horariosOcupados.includes(h)
                    const pasado = esTurnoDeshabilitado(form.fecha, h)
                    const deshabilitado = ocupado || pasado
                    return (
                      <button type="button" key={h}
                        disabled={deshabilitado}
                        onClick={() => !deshabilitado && setForm({...form, hora: h})}
                        className={`${styles.horarioBtn} ${deshabilitado ? styles.horarioBtnOcupado : ''} ${form.hora === h ? styles.horarioBtnActive : ''}`}>
                        {h}
                        {ocupado && <span className={styles.ocupadoTag}>Ocupado</span>}
                        {!ocupado && pasado && <span className={styles.ocupadoTag}>No disp.</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Dirección</label>
            <input name="direccion" value={form.direccion}
              onChange={e => setForm({...form, direccion: e.target.value})}
              placeholder="Ej: San Martín 456, Río Cuarto"
              className={styles.input} />
            <span className={styles.hint}>Solo realizamos servicios dentro de Río Cuarto.</span>
          </div>

          <div className={styles.terminosWrap}>
            <label className={styles.terminosLabel}>
              <input type="checkbox" checked={aceptaTerminos}
                onChange={e => setAceptaTerminos(e.target.checked)}
                className={styles.checkbox} />
              <span>
                Entiendo y acepto que <strong>Cepeha Fade Club se reserva el derecho de cancelar o reprogramar el turno</strong> en caso de que la dirección indicada se encuentre fuera del área de cobertura habitual, presente condiciones de acceso que comprometan la seguridad del profesional, o por causas de fuerza mayor debidamente justificadas. En tales casos, el prestador se compromete a notificar al cliente con la mayor anticipación posible a través de los medios de contacto proporcionados en esta reserva.
              </span>
            </label>
          </div>

          <button type="submit" disabled={cargando} className={styles.btnPrimary}>
            {cargando ? 'Enviando...' : 'Confirmar turno →'}
          </button>

        </form>
      </div>
    </div>
  )
}