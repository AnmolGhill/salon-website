export function InstagramIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  )
}

export function FacebookIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path fill="currentColor" d="M14.2 8.4V6.9c0-.7.4-.9 1.1-.9H16.8V3.4h-2.2C12.1 3.4 11 4.7 11 6.8v1.6H9v2.6h2V20.6h3.2v-9.6h2.2l.4-2.6h-2.6Z" />
    </svg>
  )
}

export function XIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path fill="currentColor" d="M14.7 10.3 22.4 1h-1.8l-6.7 8.1L8.3 1H1.5l8.1 12.2L1.5 23h1.8l7.1-8.6L15.7 23h6.8l-7.8-12.7Zm-2.5 3-.8-1.2L4 2.5h2.8l5.3 7.8.8 1.2 6.9 10.2h-2.8l-5.8-8.4Z" />
    </svg>
  )
}

const ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  x: XIcon,
}

export function SocialIcon({ id, size = 16 }) {
  const Icon = ICONS[id] || XIcon
  return <Icon size={size} />
}
