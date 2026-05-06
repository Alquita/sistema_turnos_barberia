'use client'

import { Toaster } from 'react-hot-toast'

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#111',
          color: '#fff',
          border: '1px solid #222',
          borderRadius: '12px',
          fontSize: '14px',
          padding: '12px 16px',
          maxWidth: '420px',
        },
        success: {
          iconTheme: { primary: '#4ade80', secondary: '#111' },
          style: {
            background: '#0f1f14',
            border: '1px solid #1a4a2a',
            color: '#fff',
          },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: '#111' },
          style: {
            background: '#1a0808',
            border: '1px solid #5a1a1a',
            color: '#fff',
          },
        },
      }}
    />
  )
}