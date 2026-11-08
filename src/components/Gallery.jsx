import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { salon } from '../../shared/salon.js'
import SectionHeading from './SectionHeading.jsx'

export default function Gallery() {
  const trackRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    const update = () => {
      setCanPrev(track.scrollLeft > 8)
      setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 8)
    }

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      const max = track.scrollWidth - track.clientWidth
      const atStart = track.scrollLeft <= 0
      const atEnd = track.scrollLeft >= max - 1
      if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) return
      event.preventDefault()
      track.scrollLeft += event.deltaY
    }

    update()
    track.addEventListener('scroll', update, { passive: true })
    track.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', update)
    return () => {
      track.removeEventListener('scroll', update)
      track.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', update)
    }
  }, [])

  function scrollByCard(direction) {
    const track = trackRef.current
    const card = track?.querySelector('.gallery-card')
    if (!track || !card) return
    const styles = window.getComputedStyle(track)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 16
    track.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' })
  }

  return (
    <section className="section" id="gallery">
      <div className="container">
        <div className="gallery-head">
          <SectionHeading
            index="01"
            eyebrow="Gallery"
            title="Inside the room."
            text="A horizontal look through the chair, the cut, and the quieter corners of the salon."
          />
          <div className="arrow-row">
            <button className="icon-button" type="button" aria-label="Previous photos" onClick={() => scrollByCard(-1)} disabled={!canPrev}>
              <ChevronLeft size={20} />
            </button>
            <button className="icon-button" type="button" aria-label="Next photos" onClick={() => scrollByCard(1)} disabled={!canNext}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          className="gallery-track"
          ref={trackRef}
          tabIndex={0}
          role="region"
          aria-label="Salon gallery. Scroll sideways, or use the arrow keys."
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              scrollByCard(1)
            }
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              scrollByCard(-1)
            }
          }}
        >
          {salon.gallery.map((item, index) => (
            <figure className="gallery-card" key={item.title}>
              <img src={item.image} alt={item.alt} loading={index === 0 ? 'eager' : 'lazy'} />
              <figcaption>
                <h3>{item.title}</h3>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
