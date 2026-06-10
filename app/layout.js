import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import ToasterProvider from './components/ToasterProvider'
import RegisterSW from './components/RegisterSW'

export const metadata = {
  title: 'Cepeha Fade Club',
  description: 'Tu barbero a domicilio en Río Cuarto',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/apple-icon-180x180.png',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Cepeha Club',
    'theme-color': '#0a0a0a',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ background: '#0a0a0a', color: '#fff', margin: 0 }}>
        {children}
        <ToasterProvider />
        <RegisterSW />
      </body>
    </html>
  )
}