import { Star } from 'lucide-react'
import { salon } from '../../shared/salon.js'
import SectionHeading from './SectionHeading.jsx'

export default function Testimonials() {
  return (
    <section className="section" id="testimonials">
      <div className="container">
        <SectionHeading
          index="06"
          eyebrow="Guests"
          title="From the chair."
          text="A few notes from people who book again."
        />
        <div className="testimonials">
          {salon.testimonials.map((item, index) => (
            <article className="testimonial reveal" key={item.name} style={{ transitionDelay: `${index * 60}ms` }}>
              <div className="testimonial-top">
                <div className="stars" aria-label="5 star review">
                  {Array.from({ length: 5 }, (_, star) => (
                    <Star key={star} size={14} fill="currentColor" />
                  ))}
                </div>
                <span>{item.detail}</span>
              </div>
              <p className="quote">“{item.quote}”</p>
              <h3>{item.name}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
