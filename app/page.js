'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

const SERVICIOS = [
  { icon: '✂️', titulo: 'Corte de pelo', desc: 'Fade, clásico, degradé a tu medida' },
  { icon: '🪒', titulo: 'Corte + Barba', desc: 'El combo completo, look definido' },
  { icon: '🧔', titulo: 'Solo Barba', desc: 'Perfilado y diseño profesional' },
  { icon: '👁️', titulo: 'Cejas', desc: 'Detalle que marca la diferencia' },
]

const RESEÑAS = [
  {
    nombre: 'Tomás García',
    inicial: 'T',
    foto: '/img/corte1.jpeg',
    texto: 'Vino a domicilio y el corte quedó perfecto. Super puntual y profesional. 100% recomendable.',
    tiempo: 'Hace 2 semanas',
  },
  {
    nombre: 'Matías Rodríguez',
    inicial: 'M',
    foto: '/img/corte2.jpeg',
    texto: 'El mejor barbero a domicilio de Río Cuarto. Se nota la dedicación en cada detalle. Ya saqué turno de nuevo.',
    tiempo: 'Hace 1 semana',
  },
  {
    nombre: 'Luciano Pérez',
    inicial: 'L',
    foto: '/img/corte3.jpeg',
    texto: 'Me sorprendió la calidad del trabajo. El fade quedó impecable y el trato muy bueno.',
    tiempo: 'Hace 3 días',
  },
  {
    nombre: 'Agustín López',
    inicial: 'A',
    foto: '/img/corte4.jpeg',
    texto: 'Vine por recomendación y no me arrepentí. Muy buen ambiente y el corte tal cual lo pedí. Crack.',
    tiempo: 'Hace 5 días',
  },
]

export default function Home() {
  const heroRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add(styles.visible)),
      { threshold: 0.15 }
    )
    document.querySelectorAll(`.${styles.fadeIn}`).forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroGlow} />
        <img src="/logo.png" alt="logo" className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>CEPEHA<br />FADE CLUB</h1>
        <p className={styles.heroSub}>Tu barbero a domicilio · Río Cuarto</p>
        <p className={styles.heroSlogan}>"Donde los detalles hacen la diferencia"</p>
        <Link href="/turno" className={styles.heroCta}>Reservar turno →</Link>
      </section>

      {/* SERVICIOS */}
      <section className={styles.section}>
        <h2 className={`${styles.sectionTitle} ${styles.fadeIn}`}>Servicios</h2>
        <div className={styles.grid}>
          {SERVICIOS.map((s, i) => (
            <div key={s.titulo} className={`${styles.card} ${styles.fadeIn}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className={styles.cardIcon}>{s.icon}</span>
              <h3 className={styles.cardTitle}>{s.titulo}</h3>
              <p className={styles.cardDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RESEÑAS */}
      <section className={styles.section}>
        <div className={`${styles.reseñasHeader} ${styles.fadeIn}`}>
          <h2 className={styles.sectionTitle}>Lo que dicen los clientes</h2>
          <div className={styles.ratingBadge}>
            <span className={styles.ratingNum}>5.0</span>
            <div>
              <div className={styles.estrellas}>★★★★★</div>
              <span className={styles.ratingLabel}>Basado en reseñas reales</span>
            </div>
          </div>
        </div>

        <div className={styles.reseñasGrid}>
          {RESEÑAS.map((r, i) => (
            <div key={r.nombre} className={`${styles.reseñaCard} ${styles.fadeIn}`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.reseñaImgWrap}>
                <img src={r.foto} alt={`Corte de ${r.nombre}`} className={styles.reseñaAvatar} />
              </div>
              <div className={styles.reseñaBody}>
                <div className={styles.reseñaTop}>
                  <div className={styles.reseñaEstrellas}>★★★★★</div>
                  <span className={styles.reseñaTiempo}>{r.tiempo}</span>
                </div>
                <p className={styles.reseñaTexto}>"{r.texto}"</p>
                <div className={styles.reseñaFooter}>
                  <div className={styles.reseñaAvatarMini}>{r.inicial}</div>
                  <div>
                    <p className={styles.reseñaNombre}>{r.nombre}</p>
                    <p className={styles.reseñaCliente}>Cliente verificado ✓</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={`${styles.ctaSection} ${styles.fadeIn}`}>
        <h2 className={styles.ctaTitle}>¿Listo para el cambio?</h2>
        <p className={styles.ctaSub}>Agendá tu turno en minutos, nosotros vamos a vos.</p>
        <Link href="/turno" className={styles.heroCta}>Sacar turno ahora →</Link>
      </section>

    </div>
  )
}