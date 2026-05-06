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

      {/* CTA FINAL */}
      <section className={`${styles.ctaSection} ${styles.fadeIn}`}>
        <h2 className={styles.ctaTitle}>¿Listo para el cambio?</h2>
        <p className={styles.ctaSub}>Agendá tu turno en minutos, nosotros vamos a vos.</p>
        <Link href="/turno" className={styles.heroCta}>Sacar turno ahora →</Link>
      </section>

    </div>
  )
}