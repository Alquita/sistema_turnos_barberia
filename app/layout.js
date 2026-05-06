import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ToasterProvider from './components/ToasterProvider'

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
        <ToasterProvider />
      </body>
    </html>
  )
}