import Link from 'next/link'
import styles from './conoceme.module.css'

const FAMOSOS = [
  { nombre: 'Alonso', categoria: 'Influencer' },
  { nombre: 'Frankillo', categoria: 'Influencer' },
  { nombre: 'Tomás Mazza', categoria: 'Influencer' },
  { nombre: 'El Loco Paul', categoria: 'Influencer' },
  { nombre: 'Tita', categoria: 'Influencer' },
  { nombre: 'Teo DM', categoria: 'Influencer' },
  { nombre: 'Monxi', categoria: 'Influencer' },
  { nombre: 'Santiago Fernandez', categoria: 'Futbolista' },
  { nombre: 'El Negro Onty', categoria: 'Participante de GH' },


]

const GH = [
  'Participantes de Gran Hermano',
  'Jugadores de fútbol profesional',
  'Influencers con miles de seguidores',
]

export default function Conoceme() {
  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero}>
        <img src="/logo.png" alt="Cepeha Fade Club" className={styles.logo} />
        <h1 className={styles.title}>Cepeha Fade Club</h1>
        <p className={styles.sub}>Barbero a domicilio · Río Cuarto, Córdoba</p>
      </section>

      {/* BIO */}
      <section className={styles.section}>
        <div className={styles.bioCard}>
          <p className={styles.bio}>
            Soy Uriel Cepeha, barbero especializado en cortes modernos y diseño de barba.
            Trabajo a domicilio en Río Cuarto para que vos no tengas que moverte —
            yo llevo el estilo hasta tu puerta.
          </p>
          <p className={styles.bio}>
            Con más de <strong style={{color:'#fff'}}>13 mil seguidores en Instagram</strong>, me fui ganando
            un nombre en la escena barbera de Río Cuarto cortándole el pelo a
            futbolistas, influencers y figuras.
          </p>
          <em className={styles.slogan}>"Donde los detalles hacen la diferencia."</em>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.section}>
        <div className={styles.stats}>
          {[
            { num: '13K+', label: 'Seguidores en Instagram' },
            { num: '100%', label: 'A domicilio' },
            { num: '⭐', label: 'Atención personalizada' },
          ].map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CLIENTES FAMOSOS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Clientes destacados</h2>
        <p className={styles.sectionSub}>Le cortó el pelo a figuras del deporte, el espectáculo y las redes.</p>

        <div className={styles.famososGrid}>
          {FAMOSOS.map(f => (
            <div key={f.nombre} className={styles.famososCard}>
              <span className={styles.famososIcon}>✂️</span>
              <span className={styles.famososNombre}>{f.nombre}</span>
              <span className={styles.famososCategoria}>{f.categoria}</span>
            </div>
          ))}
        </div>

        <div className={styles.ghList}>
          {GH.map(g => (
            <div key={g} className={styles.ghItem}>
              <span className={styles.ghDot} />
              {g}
            </div>
          ))}
        </div>
      </section>

      {/* SERVICIOS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>¿Qué hago?</h2>
        <div className={styles.servicios}>
          {[
            { icon: '✂️', nombre: 'Corte de pelo', precio: '$16.000' },
            { icon: '🪒', nombre: 'Corte + Barba', precio: '$25.000' },
            { icon: '🧔', nombre: 'Solo Barba', precio: '$11.000' },
            { icon: '👁️', nombre: 'Cejas', precio: 'de regalo🎁' },
          ].map(s => (
            <div key={s.nombre} className={styles.servicioRow}>
              <span className={styles.servicioIcon}>{s.icon}</span>
              <span className={styles.servicioNombre}>{s.nombre}</span>
              <span className={styles.servicioPrecio}>{s.precio}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>¿Te animás al cambio?</h2>
        <p className={styles.ctaSub}>Agendá tu turno en minutos.</p>
        <Link href="/turno" className={styles.btn}>Sacar turno →</Link>
      </section>

    </div>
  )
}