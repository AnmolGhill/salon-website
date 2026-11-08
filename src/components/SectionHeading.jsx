export default function SectionHeading({ index, eyebrow, title, text }) {
  return (
    <header className="section-heading reveal">
      <p className="eyebrow"><span>{index}</span>{eyebrow}</p>
      <h2>{title}</h2>
      {text ? <p className="lede">{text}</p> : null}
    </header>
  )
}
