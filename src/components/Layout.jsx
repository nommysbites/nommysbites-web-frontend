import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import FloatingCartBar from './FloatingCartBar'
import FloatingWhatsApp from './FloatingWhatsApp'
import AuthToast from './AuthToast'

export default function Layout() {
  return (
    <div className="site-wrapper">
      <AuthToast />
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
      <FloatingCartBar />
      <FloatingWhatsApp />
    </div>
  )
}
