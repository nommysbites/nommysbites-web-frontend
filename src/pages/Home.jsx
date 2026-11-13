import Hero from '../components/Hero'
import Packages from '../components/Packages'
import Gifts from '../components/Gifts'
import Events from '../components/Events'
import Outlet from '../components/Outlet'
import Testimonials from '../components/Testimonials'
import CTA from '../components/CTA'

export default function Home() {
  return (
    <div className="home-page">
      <Hero />
      <Packages />
      <Gifts />
      <Events />
      <Outlet />
      <Testimonials />
      <CTA />
    </div>
  )
}
