import { Scissors } from 'lucide-react'
import { salon } from '../../shared/salon.js'
import { hoursSummary } from '../../shared/booking.js'
import { SocialIcon } from './SocialIcons.jsx'

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About Us' },
  { id: 'contact', label: 'Contact' },
  { id: 'booking', label: 'Book Appointment' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const summary = hoursSummary(salon)

  function go(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <button className="logo" type="button" onClick={() => go('home')}>
            <span className="logo-mark" aria-hidden="true"><Scissors size={16} /></span>
            <span>
              <span className="logo-word">Raju</span>
              <small>Hair Salon</small>
            </span>
          </button>
          <p style={{ marginTop: '0.9rem' }}>{salon.hero.text}</p>
          <div className="footer-social">
            {salon.socials.map((social) => (
              <a key={social.id} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                <SocialIcon id={social.id} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3>Explore</h3>
          <ul>
            {LINKS.map((link) => (
              <li key={link.id}>
                <button type="button" onClick={() => go(link.id)}>{link.label}</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <ul>
            <li>{salon.address.line1}</li>
            <li>{salon.address.line2}</li>
            <li><a href={`tel:${salon.phoneTel}`}>{salon.phoneDisplay}</a></li>
            <li><a href={`mailto:${salon.email}`}>{salon.email}</a></li>
            <li>{summary.openDays}, {summary.hours}</li>
          </ul>
        </div>
      </div>
      <div className="container legal">
        © {year} {salon.legalName}. All rights reserved.
      </div>
    </footer>
  )
}
