'use client'

import { useState } from 'react'
import styles from './productos.module.css'

const PRODUCTOS = [
  { id: 'pomada', nombre: 'Pomada para el cabello', precio: 12000, imagen: '/img/pomada.jpeg' },
  { id: 'polvo', nombre: 'Polvo texturizador', precio: 10000, imagen: '/img/polvo.jpeg' },
  { id: 'aceite', nombre: 'Aceite para la barba', precio: 10000, imagen: '/img/aceite.jpeg' },
]

const WA_NUMBER = '5493546544752'

export default function Productos() {
  const [cart, setCart] = useState({})

  const agregar = (id) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  const quitar = (id) => {
    setCart(prev => {
      const next = { ...prev }
      if (next[id] <= 1) delete next[id]
      else next[id]--
      return next
    })
  }

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const prod = PRODUCTOS.find(p => p.id === id)
    return sum + (prod?.precio || 0) * qty
  }, 0)

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0)

  const abrirWhatsApp = () => {
    const lineas = ['¡Hola! Quiero coordinar el pedido de estos productos:\n']
    Object.entries(cart).forEach(([id, qty]) => {
      const prod = PRODUCTOS.find(p => p.id === id)
      lineas.push(`• ${prod.nombre} x${qty} — $${(prod.precio * qty).toLocaleString('es-AR')}`)
    })
    lineas.push(`\nTotal: $${total.toLocaleString('es-AR')}`)
    lineas.push('\n📦 ¿Cuándo puedo pasar a retirar?')
    const msg = encodeURIComponent(lineas.join('\n'))
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>🛒 Productos</span>
          <h1 className={styles.title}>Nuestros productos</h1>
          <p className={styles.sub}>Completá el look con los mejores productos</p>
        </div>

        <div className={styles.productosGrid}>
          {PRODUCTOS.map(p => (
            <div key={p.id} className={styles.card}>
              <div className={styles.imgCircle}>
                {p.imagen ? (
                  <img src={p.imagen} alt={p.nombre} className={styles.img} />
                ) : (
                  <span className={styles.imgPlaceholder}>Foto</span>
                )}
              </div>
              <h3 className={styles.prodName}>{p.nombre}</h3>
              <p className={styles.prodPrice}>${p.precio.toLocaleString('es-AR')}</p>
              <button className={styles.btnAgregar} onClick={() => agregar(p.id)}>
                {cart[p.id] ? `Agregar otro (${cart[p.id]})` : 'Agregar +'}
              </button>
            </div>
          ))}
        </div>

        {totalItems > 0 && (
          <div className={styles.cartSection}>
            <h2 className={styles.cartTitle}>🛍️ Tu pedido ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</h2>
            <div className={styles.cartItems}>
              {Object.entries(cart).map(([id, qty]) => {
                const prod = PRODUCTOS.find(p => p.id === id)
                return (
                  <div key={id} className={styles.cartItem}>
                    <div className={styles.cartInfo}>
                      <span className={styles.cartName}>{prod.nombre}</span>
                      <span className={styles.cartPriceQty}>${(prod.precio * qty).toLocaleString('es-AR')}</span>
                    </div>
                    <div className={styles.cartQty}>
                      <button className={styles.qtyBtn} onClick={() => quitar(id)}>−</button>
                      <span className={styles.qtyNum}>{qty}</span>
                      <button className={styles.qtyBtn} onClick={() => agregar(id)}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className={styles.cartTotal}>
              <span>Total</span>
              <span className={styles.totalPrice}>${total.toLocaleString('es-AR')}</span>
            </div>
            <button className={styles.btnClear} onClick={() => setCart({})} title="Vaciar carrito">
              🗑 Vaciar carrito
            </button>
            <button className={styles.btnWa} onClick={abrirWhatsApp}>
              Coordinar por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
