import Link from 'next/link'
import styles from './Footer.module.css'

const REDES = [
  { href: 'https://www.instagram.com/cepeha.fade.club/', label: 'Instagram', icon: '🅾' },
  { href: 'https://www.youtube.com/@Cepehafadeclub', label: 'YouTube', icon: '▶️' },
  { href: 'https://www.tiktok.com/@barberia_peluqueria2', label: 'TikTok', icon: '🎵' },
]

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/turno', label: 'Sacar turno' },
  { href: '/conoceme', label: 'Conoceme' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>

        <div className={styles.brand}>
          <img src="/logo.png" alt="logo" className={styles.logo} />
          <div>
            <p className={styles.brandName}>CEPEHA FADE CLUB</p>
            <p className={styles.brandSub}>Tu barbero a domicilio · Río Cuarto</p>
            <p className={styles.slogan}>"Donde los detalles hacen la diferencia"</p>
          </div>
        </div>

        <div className={styles.cols}>
          <div className={styles.col}>
            <p className={styles.colTitle}>Páginas</p>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} className={styles.colLink}>{l.label}</Link>
            ))}
          </div>
          <div className={styles.col}>
            <p className={styles.colTitle}>Redes</p>
            {REDES.map(r => (
              <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer" className={styles.colLink}>
                {r.icon} {r.label}
              </a>
            ))}
          </div>
        </div>

      </div>

      <div className={styles.bottom}>
        <p className={styles.copy}>© 2025 Cepeha Fade Club · Río Cuarto, Córdoba</p>
      </div>
    </footer>
  )
}