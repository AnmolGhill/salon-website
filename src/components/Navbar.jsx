import { useEffect, useState } from 'react'
import { Menu, Scissors, X } from 'lucide-react'

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About Us' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar({ onBook }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('nav-open', open)
    return () => document.body.classList.remove('nav-open')
  }, [open])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth >= 900) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    const sections = LINKS
      .map((link) => document.getElementById(link.id))
      .filter(Boolean)
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target?.id) setActive(visible.target.id)
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0.15, 0.4] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  function go(id) {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`navbar ${scrolled || open ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="navbar-inner">
        <button className="logo" type="button" onClick={() => go('home')}>
          <span className="logo-mark" aria-hidden="true"><Scissors size={16} /></span>
          <span>
            <span className="logo-word">Raju</span>
            <small>Hair Salon</small>
          </span>
        </button>

        <nav className="desktop-nav" aria-label="Primary">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              className={active === link.id ? 'is-active' : ''}
              onClick={() => go(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button className="btn btn-gold nav-book" type="button" onClick={() => { setOpen(false); onBook() }}>
          Book Appointment
        </button>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav id="mobile-nav" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-label="Mobile" inert={!open ? true : undefined}>
        {LINKS.map((link) => (
          <button key={link.id} className="link" type="button" onClick={() => go(link.id)}>
            {link.label}
          </button>
        ))}
        <button className="btn btn-gold" type="button" onClick={() => { setOpen(false); onBook() }}>
          Book Appointment
        </button>
      </nav>
    </header>
  )
}
