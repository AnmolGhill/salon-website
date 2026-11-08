import { Heart, IndianRupee, ShieldCheck, Sparkles, Users } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'

const REASONS = [
  {
    icon: Users,
    title: 'Professional Staff',
    text: 'Senior stylists who consult first, then cut. The same standard on a quiet Tuesday or a full Saturday.',
  },
  {
    icon: Sparkles,
    title: 'Premium Products',
    text: 'Colour, care, and finishers chosen for how they behave in Mumbai weather, not for a crowded shelf.',
  },
  {
    icon: IndianRupee,
    title: 'Affordable Pricing',
    text: 'Published prices, no surprise add-ons at the chair. You know the number before you sit down.',
  },
  {
    icon: ShieldCheck,
    title: 'Clean Environment',
    text: 'Fresh linen, sterilised tools, and a room that is reset completely between every guest.',
  },
  {
    icon: Heart,
    title: 'Customer Satisfaction',
    text: 'If the finish is not right, we correct it before you leave. The appointment is not over until you are.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="section" id="why">
      <div className="container">
        <SectionHeading
          index="03"
          eyebrow="Why Raju Hair Salon"
          title="A calmer kind of appointment."
          text="The details guests mention when they come back."
        />
        <div className="reasons">
          {REASONS.map((reason, index) => {
            const Icon = reason.icon
            return (
              <article className="reason reveal" key={reason.title} style={{ transitionDelay: `${index * 50}ms` }}>
                <div className="reason-top">
                  <span className="reason-icon" aria-hidden="true"><Icon size={18} /></span>
                </div>
                <h3>{reason.title}</h3>
                <p>{reason.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
