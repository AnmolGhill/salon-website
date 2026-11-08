import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Gallery from './components/Gallery.jsx'
import Services from './components/Services.jsx'
import WhyChooseUs from './components/WhyChooseUs.jsx'
import BookingForm from './components/BookingForm.jsx'
import About from './components/About.jsx'
import Testimonials from './components/Testimonials.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

function useScrollReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])
}

export default function App() {
  const [service, setService] = useState('')
  useScrollReveal()

  function book(nextService) {
    if (typeof nextService === 'string') setService(nextService)
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar onBook={() => book(service)} />
      <main id="main">
        <Hero onBook={() => book()} />
        <Gallery />
        <Services onBook={book} />
        <WhyChooseUs />
        <BookingForm selectedService={service} onServiceChange={setService} />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
