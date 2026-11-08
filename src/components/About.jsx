import { salon } from '../../shared/salon.js'

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container about-grid">
        <div className="about-photo reveal">
          <img src={salon.about.image} alt={salon.about.imageAlt} loading="lazy" />
        </div>
        <div className="about-copy reveal">
          <p className="eyebrow"><span>05</span>{salon.about.eyebrow}</p>
          <h2>{salon.about.title}</h2>
          {salon.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="stats">
            {salon.about.highlights.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
