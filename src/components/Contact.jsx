import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { salon } from '../../shared/salon.js'
import { hoursSummary } from '../../shared/booking.js'
import SectionHeading from './SectionHeading.jsx'
import { SocialIcon } from './SocialIcons.jsx'

export default function Contact() {
  const summary = hoursSummary(salon)
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(salon.address.mapQuery)}&z=15&output=embed`
  const whatsapp = `https://wa.me/${salon.phoneWhatsApp}?text=${encodeURIComponent('Hello, I would like to book an appointment.')}`

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="contact-head">
          <SectionHeading
            index="07"
            eyebrow="Visit"
            title="Find the salon."
            text="Walk-ins are welcome when the chair is free. A booking is the sure way to keep your time."
          />
        </div>
        <div className="contact-grid">
          <div className="info-list">
            <article className="info-card">
              <MapPin size={18} aria-hidden="true" />
              <div>
                <h3>Address</h3>
                <p>{salon.address.line1}<br />{salon.address.line2}</p>
              </div>
            </article>
            <article className="info-card">
              <Phone size={18} aria-hidden="true" />
              <div>
                <h3>Mobile</h3>
                <p><a href={`tel:${salon.phoneTel}`}>{salon.phoneDisplay}</a></p>
              </div>
            </article>
            <article className="info-card">
              <Clock size={18} aria-hidden="true" />
              <div>
                <h3>Hours</h3>
                <p>{summary.openDays}<br />{summary.hours}<br />Closed {summary.closedDays}</p>
              </div>
            </article>
            <div className="social-row">
              <a className="btn btn-gold" href={whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle size={18} />
                WhatsApp
              </a>
              {salon.socials.map((social) => (
                <a key={social.id} className="icon-link" href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                  <SocialIcon id={social.id} />
                </a>
              ))}
            </div>
          </div>
          <iframe
            className="map-frame"
            title="Raju Hair Salon on Google Maps"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
