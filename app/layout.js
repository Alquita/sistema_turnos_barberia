import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Cepeha Fade Club',
  description: 'Tu barbero a domicilio en Río Cuarto',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ background: '#0a0a0a', color: '#fff', margin: 0 }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
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
      </body>
    </html>
  )
}