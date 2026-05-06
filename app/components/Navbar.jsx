'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/turno', label: 'Sacar turno' },
    { href: '/conoceme', label: 'Conoceme' },
  ]

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <Link href="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
        <img src="/logo.png" alt="logo" className={styles.logo} />
        <div className={styles.brandText}>
          <span className={styles.brandName}>CEPEHA</span>
          <span className={styles.brandSub}>FADE CLUB</span>
        </div>
      </Link>

      <div className={styles.desktopLinks}>
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`${styles.link} ${pathname === l.href ? styles.active : ''}`}>
            {l.label}
          </Link>
        ))}
        <Link href="/turno" className={styles.ctaBtn}>Reservar ✂</Link>
      </div>

      <button
        className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menú">
        <span /><span /><span />
      </button>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`${styles.mobileLink} ${pathname === l.href ? styles.mobileLinkActive : ''}`}
            onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
        <Link href="/turno" className={styles.mobileCta} onClick={() => setMenuOpen(false)}>
          Reservar turno ✂
        </Link>
      </div>
    </nav>
  )
}