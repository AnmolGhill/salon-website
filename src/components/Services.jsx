import { salon, formatINR } from '../../shared/salon.js'
import SectionHeading from './SectionHeading.jsx'

export default function Services({ onBook }) {
  return (
    <section className="section" id="services">
      <div className="container">
        <SectionHeading
          index="02"
          eyebrow="Services"
          title="What we do well."
          text="Six services, priced clearly. Choose one and the appointment form will already have it selected."
        />
        <div className="card-grid">
          {salon.services.map((service, index) => (
            <article className="service-card reveal" key={service.id} style={{ transitionDelay: `${index * 60}ms` }}>
              <div className="media">
                <img src={service.image} alt={service.imageAlt} loading="lazy" />
              </div>
              <div className="service-body">
                <div className="service-meta">
                  <h3>{service.name}</h3>
                  <span className="duration">{service.durationLabel}</span>
                </div>
                <p>{service.description}</p>
                <div className="price-row">
                  <strong className="price">{formatINR(service.price)}</strong>
                </div>
                <button className="btn btn-ghost btn-block" type="button" onClick={() => onBook(service.name)}>
                  Book Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
