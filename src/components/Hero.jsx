import { salon } from '../../shared/salon.js'

export default function Hero({ onBook }) {
  return (
    <section className="hero" id="home">
      <img
        className="hero-media"
        src="/images/hero.jpg"
        alt="Warm, dimly lit Raju Hair Salon interior"
        fetchPriority="high"
      />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-copy">
          <p className="eyebrow"><span>Est. {salon.established}</span>{salon.hero.eyebrow}</p>
          <h1>
            {salon.hero.titleLead}
            <em>{salon.hero.titleAccent}</em>
          </h1>
          <p className="hero-text">{salon.hero.text}</p>
          <div className="hero-actions">
            <button className="btn btn-gold" type="button" onClick={onBook}>
              Book Appointment
            </button>
            <a className="btn btn-ghost" href="#services">
              Explore Our Services
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
