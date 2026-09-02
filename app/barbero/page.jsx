'use client'

import { useState, useEffect, useRef } from 'react'
import emailjs from '@emailjs/browser'
import styles from './barbero.module.css'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const TEMPLATE_CLIENTE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CLIENTE
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

const SERVICIOS = [
  { id: 'corte', nombre: 'Corte de pelo' },
  { id: 'corte_barba', nombre: 'Corte + Barba' },
  { id: 'barba', nombre: 'Solo Barba' },
  { id: 'globales', nombre: 'Globales' },
  { id: 'mechas', nombre: 'Mechas' },
  { id: 'permanente', nombre: 'Permanente' },
]

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatearFecha(fecha) {
  const d = new Date(fecha + 'T00:00:00')
  return `${DIAS_ES[d.getDay()]} ${d.getDate()} ${MESES_ES[d.getMonth()]}`
}

function getHorariosDefault(fecha) {
  const dia = new Date(fecha + 'T00:00:00').getDay()
  const horariosTarde = ['16:00', '17:00', '18:00', '19:00', '20:00']
  const horariosMañana = ['08:00', '09:00', '10:00', '11:00']
  if (dia === 6) return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00']
  if (dia === 2 || dia === 4) return [...horariosMañana, ...horariosTarde]
  return horariosTarde
}

export default function Barbero() {
  const [token, setToken] = useState(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [cargandoLogin, setCargandoLogin] = useState(false)

  const [turnos, setTurnos] = useState([])
  const [excepciones, setExcepciones] = useState([])
  const [cargando, setCargando] = useState(true)

  // Modal reasignar
  const [modalReasignar, setModalReasignar] = useState(null)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaHora, setNuevaHora] = useState('')

  // Modal excepción
  const [modalExc, setModalExc] = useState(false)
  const [excFecha, setExcFecha] = useState('')
  const [excHorarios, setExcHorarios] = useState([])
  const [excCustomManiana, setExcCustomManiana] = useState('')
  const [excCustomTarde, setExcCustomTarde] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const pickerRef = useRef(null)

  const [msg, setMsg] = useState('')
  const [msgTipo, setMsgTipo] = useState('')

  const hoy = new Date()
  const fechas = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() + i)
    if (d.getDay() >= 2 && d.getDay() <= 6) {
      fechas.push(d.toISOString().split('T')[0])
    }
  }

  useEffect(() => {
    function handleClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setDatePickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Recuperar token de localStorage
  useEffect(() => {
    const saved = localStorage.getItem('barbero_token')
    if (saved) {
      fetch('/api/barbero/auth', {
        headers: { 'Authorization': `Bearer ${saved}` }
      })
        .then(r => r.json())
        .then(d => {
          if (d.valid) {
            setToken(saved)
          } else {
            localStorage.removeItem('barbero_token')
          }
        })
        .catch(() => localStorage.removeItem('barbero_token'))
    }
    setCargando(false)
  }, [])

  // Cargar datos
  useEffect(() => {
    if (!token) return
    cargarDatos()
  }, [token])

  function cargarDatos() {
    const headers = { 'Authorization': `Bearer ${token}` }
    Promise.all([
      fetch('/api/barbero/turnos', { headers }).then(r => r.json()),
      fetch('/api/barbero/excepciones', { headers }).then(r => r.json()),
    ]).then(([t, e]) => {
      if (t.error) return mostrarMsg(t.error, 'error')
      if (e.error) return mostrarMsg(e.error, 'error')
      setTurnos(t.turnos || [])
      setExcepciones(e.excepciones || [])
    }).catch(() => mostrarMsg('Error de conexión al cargar datos', 'error'))
  }

  function mostrarMsg(texto, tipo) {
    setMsg(texto)
    setMsgTipo(tipo)
    setTimeout(() => { setMsg('') }, 4000)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setCargandoLogin(true)
    setLoginError('')
    try {
      const res = await fetch('/api/barbero/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('barbero_token', data.token)
        setToken(data.token)
      } else {
        setLoginError('Contraseña incorrecta')
      }
    } catch {
      setLoginError('Error de conexión')
    }
    setCargandoLogin(false)
  }

  function handleLogout() {
    localStorage.removeItem('barbero_token')
    setToken(null)
    setTurnos([])
    setExcepciones([])
  }

  async function handleCancelar(turno) {
    if (!confirm(`¿Cancelar turno de ${turno.nombre} (${turno.fecha} a las ${turno.hora})?`)) return

    const res = await fetch('/api/cancelar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token: turno.token_cancelacion, origen: 'barbero' }),
    })
    const data = await res.json()

    if (data.success) {
      // El aviso al cliente lo manda /api/cancelar desde el servidor.
      mostrarMsg('Turno cancelado', 'success')
      cargarDatos()
    } else {
      mostrarMsg(data.error || 'Error al cancelar', 'error')
    }
  }

  function abrirReasignar(turno) {
    setModalReasignar(turno)
    setNuevaFecha(turno.fecha)
    setNuevaHora(turno.hora)
  }

  async function handleReasignar() {
    if (!nuevaFecha || !nuevaHora) return
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
    const res = await fetch('/api/barbero/turnos', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id: modalReasignar.id, fecha: nuevaFecha, hora: nuevaHora }),
    })
    const data = await res.json()

    if (data.success) {
      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_CLIENTE, {
          nombre: modalReasignar.nombre,
          email_cliente: modalReasignar.email,
          servicio: SERVICIOS.find(s => s.id === modalReasignar.servicio)?.nombre || modalReasignar.servicio,
          fecha: nuevaFecha,
          hora: nuevaHora,
          direccion: modalReasignar.direccion,
          cancel_link: '',
          maps_link: '',
          mensaje_cancelacion: `🔄 Tu turno fue reprogramado para el ${formatearFecha(nuevaFecha)} a las ${nuevaHora}.`,
        }, PUBLIC_KEY)
      } catch {}
      mostrarMsg(`Turno de ${modalReasignar.nombre} pasado a ${formatearFecha(nuevaFecha)} ${nuevaHora}`, 'success')
      setModalReasignar(null)
      cargarDatos()
    } else {
      mostrarMsg('Error al reagendar', 'error')
    }
  }

  function obtenerHorariosParaFecha(fecha) {
    const exc = excepciones.find(e => e.fecha === fecha)
    if (exc) return exc.horarios
    return getHorariosDefault(fecha)
  }

  async function handleGuardarExc() {
    if (!excFecha || excHorarios.length === 0) return
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
    const res = await fetch('/api/barbero/excepciones', {
      method: 'POST',
      headers,
      body: JSON.stringify({ fecha: excFecha, horarios: excHorarios }),
    })
    const data = await res.json()
    if (data.success) {
      mostrarMsg(`Excepción guardada para ${formatearFecha(excFecha)}`, 'success')
      setModalExc(false)
      setExcFecha('')
      setExcHorarios([])
      cargarDatos()
    } else {
      mostrarMsg('Error al guardar', 'error')
    }
  }

  async function handleEliminarExc(id) {
    if (!confirm('¿Eliminar esta excepción?')) return
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
    const res = await fetch('/api/barbero/excepciones', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (data.success) {
      mostrarMsg('Excepción eliminada', 'success')
      cargarDatos()
    }
  }

  function toggleExcHorario(h) {
    setExcHorarios(prev =>
      prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h].sort()
    )
  }

  function agregarCustomHorario(seccion) {
    const input = seccion === 'mañana' ? excCustomManiana : excCustomTarde
    const val = input.trim()
    if (!/^\d{2}:\d{2}$/.test(val)) {
      mostrarMsg('Formato inválido. Usá HH:MM (ej: 12:00)', 'error')
      return
    }
    if (excHorarios.includes(val)) {
      mostrarMsg('Ese horario ya está agregado', 'error')
      return
    }
    setExcHorarios(prev => [...prev, val].sort())
    if (seccion === 'mañana') setExcCustomManiana('')
    else setExcCustomTarde('')
  }

  // --- LOGIN ---
  if (!token && !cargando) {
    return (
      <div className={styles.loginWrap}>
        <form onSubmit={handleLogin} className={styles.loginCard}>
          <div className={styles.loginIcon}>✂️</div>
          <h1 className={styles.loginTitle}>Acceso barbero</h1>
          <p className={styles.loginSub}>Ingresá tu contraseña para administrar turnos</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            className={styles.loginInput}
            autoFocus
          />
          <button type="submit" disabled={cargandoLogin || !password} className={styles.loginBtn}>
            {cargandoLogin ? 'Ingresando...' : 'Ingresar'}
          </button>
          {loginError && <p className={styles.loginError}>{loginError}</p>}
        </form>
      </div>
    )
  }

  if (cargando) return null

  // --- DASHBOARD ---
  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div className={styles.titleBox}>
            <h1 className={styles.title}>Panel del Barbero</h1>
            <span className={styles.badge}>⚡</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>Cerrar sesión</button>
        </div>

        {msg && (
          <div className={styles.card} style={{ borderColor: msgTipo === 'success' ? '#1a4a2a' : '#5a1a1a' }}>
            <p className={msgTipo === 'success' ? styles.successToast : styles.loginError}>{msg}</p>
          </div>
        )}

        {/* Turnos */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className={styles.cardTitle} style={{ margin: 0 }}>📅 Próximos turnos</h2>

          </div>
          {turnos.length === 0 ? (
            <p className={styles.empty}>No hay turnos próximos</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Servicio</th>
                    <th>Dirección</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {turnos.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{t.nombre}</td>
                      <td style={{ color: '#888', fontSize: 13 }}>{t.telefono}</td>
                      <td>{formatearFecha(t.fecha)}</td>
                      <td style={{ fontWeight: 600 }}>{t.hora.slice(0, 5)}</td>
                      <td>
                        <span className={styles.servicioTag}>
                          {SERVICIOS.find(s => s.id === t.servicio)?.nombre || t.servicio}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: '#888', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.direccion}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button onClick={() => abrirReasignar(t)} className={styles.actionBtn}>✏️</button>
                          <button onClick={() => handleCancelar(t)} className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Excepciones */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>⚙️ Excepciones de horarios</h2>
          {excepciones.length > 0 && (
            <div className={styles.excList}>
              {excepciones.map(e => (
                <div key={e.id} className={styles.excItem}>
                  <span className={styles.excFecha}>{formatearFecha(e.fecha)}</span>
                  <div className={styles.excHorarios}>
                    {e.horarios.map(h => (
                      <span key={h} className={styles.excHorarioTag}>{h}</span>
                    ))}
                  </div>
                  <button onClick={() => handleEliminarExc(e.id)} className={styles.excDeleteBtn}>×</button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => { setModalExc(true); setExcFecha(''); setExcHorarios([]); setExcCustomManiana(''); setExcCustomTarde('') }} className={styles.addBtn}>
            + Agregar excepción
          </button>
        </div>

      </div>

      {/* Modal Reasignar */}
      {modalReasignar && (
        <div className={styles.overlay} onClick={() => setModalReasignar(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Reagendar: {modalReasignar.nombre}</h3>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Nueva fecha</label>
              <input
                type="date"
                value={nuevaFecha}
                onChange={e => { setNuevaFecha(e.target.value); setNuevaHora('') }}
                className={styles.modalInput}
              />
            </div>

            {nuevaFecha && (
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nueva hora</label>
                <div className={styles.modalHorarios}>
                  {obtenerHorariosParaFecha(nuevaFecha).map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setNuevaHora(h)}
                      className={`${styles.modalHorarioBtn} ${nuevaHora === h ? styles.modalHorarioBtnSelected : ''}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button onClick={() => setModalReasignar(null)} className={styles.modalBtnCancel}>Cancelar</button>
              <button onClick={handleReasignar} disabled={!nuevaFecha || !nuevaHora} className={styles.modalBtnPrimary}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excepción */}
      {modalExc && (
        <div className={styles.overlay} onClick={() => setModalExc(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Agregar excepción</h3>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Fecha</label>
              <div className={styles.datePickerWrap}>
                <button type="button" onClick={() => setDatePickerOpen(!datePickerOpen)} className={styles.datePickerBtn}>
                  <span className={styles.datePickerIcon}>📅</span>
                  <span className={styles.datePickerText}>{excFecha ? formatearFecha(excFecha) : 'Elegí una fecha'}</span>
                  <svg className={`${styles.datePickerChevron} ${datePickerOpen ? styles.datePickerChevronOpen : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {datePickerOpen && (
                  <div className={styles.datePickerPopup} ref={pickerRef}>
                    <div className={styles.datePickerGrid}>
                      {fechas.map(f => {
                        const d = new Date(f + 'T00:00:00')
                        const tieneExc = excepciones.some(e => e.fecha === f)
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => { setExcFecha(f); setExcHorarios(tieneExc ? excepciones.find(e => e.fecha === f).horarios : []); setDatePickerOpen(false) }}
                            className={`${styles.datePickerFechaBtn} ${excFecha === f ? styles.datePickerFechaBtnActive : ''} ${tieneExc ? styles.datePickerFechaBtnExc : ''}`}
                          >
                            <span className={styles.datePickerFechaDia}>{DIAS_ES[d.getDay()]}</span>
                            <span className={styles.datePickerFechaNum}>{d.getDate()}</span>
                            <span className={styles.datePickerFechaMes}>{MESES_ES[d.getMonth()]}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {excFecha && (
              <>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>🌅 Mañana</label>
                  <div className={styles.modalHorarios}>
                    {['08:00','09:00','10:00','11:00'].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleExcHorario(h)}
                        className={`${styles.modalHorarioBtn} ${excHorarios.includes(h) ? styles.modalHorarioBtnSelected : ''}`}
                      >
                        {h}
                      </button>
                    ))}
                    {excHorarios.filter(h => h < '14:00' && !['08:00','09:00','10:00','11:00'].includes(h)).map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleExcHorario(h)}
                        className={`${styles.modalHorarioBtn} ${styles.modalHorarioBtnSelected}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  <div className={styles.modalCustomRow}>
                    <input
                      type="text"
                      placeholder="HH:MM"
                      value={excCustomManiana}
                      onChange={e => setExcCustomManiana(e.target.value)}
                      className={styles.modalCustomInput}
                    />
                    <button type="button" onClick={() => agregarCustomHorario('mañana')} className={styles.modalCustomAddBtn}>
                      Agregar
                    </button>
                  </div>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>🌆 Tarde</label>
                  <div className={styles.modalHorarios}>
                    {['14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleExcHorario(h)}
                        className={`${styles.modalHorarioBtn} ${excHorarios.includes(h) ? styles.modalHorarioBtnSelected : ''}`}
                      >
                        {h}
                      </button>
                    ))}
                    {excHorarios.filter(h => h >= '14:00' && !['14:00','15:00','16:00','17:00','18:00','19:00','20:00'].includes(h)).map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleExcHorario(h)}
                        className={`${styles.modalHorarioBtn} ${styles.modalHorarioBtnSelected}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  <div className={styles.modalCustomRow}>
                    <input
                      type="text"
                      placeholder="HH:MM"
                      value={excCustomTarde}
                      onChange={e => setExcCustomTarde(e.target.value)}
                      className={styles.modalCustomInput}
                    />
                    <button type="button" onClick={() => agregarCustomHorario('tarde')} className={styles.modalCustomAddBtn}>
                      Agregar
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className={styles.modalActions}>
              <button onClick={() => setModalExc(false)} className={styles.modalBtnCancel}>Cancelar</button>
              <button onClick={handleGuardarExc} disabled={!excFecha || excHorarios.length === 0} className={styles.modalBtnPrimary}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
