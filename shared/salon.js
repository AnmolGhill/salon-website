/**
 * Salon content, prices, hours, and contact details.
 * Edit this file to change what guests see and what the booking API allows.
 * Keep service names in sync: the form, slot API, and database all use `name`.
 */

export const salon = {
  name: 'Raju Hair Salon',
  legalName: 'Raju Hair Salon',
  established: '2014',
  city: 'Mumbai',
  hero: {
    eyebrow: 'Private grooming · Bandra',
    titleLead: 'Your Style.',
    titleAccent: 'Your Identity.',
    text: 'A quiet room for precise cuts, considered colour, and grooming that feels unhurried. Senior stylists, calm light, and an hour that belongs only to you.',
  },
  about: {
    eyebrow: 'The house',
    title: 'Grooming, done with patience.',
    paragraphs: [
      'Raju Hair Salon opened in Bandra as a small chair and a point of view: a haircut should feel like it was made for one person, not pulled from a menu of trends.',
      'Twelve years on, the room is still unhurried. We work with a short list of services, salon-grade colour and care, and stylists who would rather ask one more question than rush the finish.',
    ],
    highlights: [
      { value: '12+', label: 'Years in the chair' },
      { value: '8k+', label: 'Guests returned' },
      { value: '4.9', label: 'Average rating' },
    ],
    image: '/images/about.jpg',
    imageAlt: 'Stylist finishing a precision haircut at Raju Hair Salon',
  },
  phoneDisplay: '+91 98765 43210',
  phoneTel: '+919876543210',
  phoneWhatsApp: '919876543210',
  email: 'hello@rajuhairsalon.example',
  address: {
    line1: '18, Linking Road',
    line2: 'Bandra West, Mumbai 400050',
    mapQuery: 'Linking Road, Bandra West, Mumbai',
  },
  hours: {
    open: '10:00',
    close: '20:00',
    slotMinutes: 30,
    timeZone: 'Asia/Kolkata',
    closedWeekdays: [1],
  },
  bookingWindowDays: 45,
  socials: [
    { id: 'instagram', label: 'Instagram', href: 'https://instagram.com/' },
    { id: 'facebook', label: 'Facebook', href: 'https://facebook.com/' },
    { id: 'x', label: 'X', href: 'https://x.com/' },
  ],
  gallery: [
    { title: 'The Atelier', image: '/images/gallery-atelier.jpg', alt: 'Bright salon interior with styling chairs' },
    { title: 'Barber Chair', image: '/images/gallery-chair.jpg', alt: 'Classic barber chair in a dark salon' },
    { title: 'Signature Cut', image: '/images/gallery-cut.jpg', alt: 'Barber cutting a guest’s hair' },
    { title: 'Hair Styling', image: '/images/gallery-styling.jpg', alt: 'Stylist shaping long hair' },
    { title: 'Beard Craft', image: '/images/gallery-beard.jpg', alt: 'Close beard grooming in progress' },
    { title: 'Quiet Rooms', image: '/images/gallery-room.jpg', alt: 'Salon stations and mirrors' },
    { title: 'The Finish', image: '/images/gallery-finish.jpg', alt: 'Finished men’s haircut' },
    { title: 'Evening Light', image: '/images/gallery-light.jpg', alt: 'Salon floor in warm evening light' },
  ],
  services: [
    {
      id: 'haircut',
      name: 'Haircut',
      price: 499,
      durationMinutes: 45,
      durationLabel: '45 min',
      description: 'A consult, a precise cut, and a finish shaped to the way you actually wear your hair.',
      image: '/images/service-haircut.jpg',
      imageAlt: 'Barber portrait in the salon',
    },
    {
      id: 'beard',
      name: 'Beard Styling',
      price: 299,
      durationMinutes: 30,
      durationLabel: '30 min',
      description: 'Shape, line-up, and a hot-towel finish so the beard looks considered, not clipped in a hurry.',
      image: '/images/service-beard.jpg',
      imageAlt: 'Beard styling at the chair',
    },
    {
      id: 'wash',
      name: 'Hair Wash',
      price: 199,
      durationMinutes: 30,
      durationLabel: '30 min',
      description: 'A scalp cleanse and conditioning ritual. A quiet reset before the rest of the day.',
      image: '/images/service-wash.jpg',
      imageAlt: 'Hair being washed at the salon basin',
    },
    {
      id: 'color',
      name: 'Hair Coloring',
      price: 1499,
      durationMinutes: 90,
      durationLabel: '90 min',
      description: 'Dimensional colour, grey blending, or a full refresh with salon-grade colour.',
      image: '/images/service-color.jpg',
      imageAlt: 'Hair colour being applied',
    },
    {
      id: 'facial',
      name: 'Facial',
      price: 799,
      durationMinutes: 45,
      durationLabel: '45 min',
      description: 'A clarifying facial that leaves skin calm, even, and ready to be seen up close.',
      image: '/images/service-facial.jpg',
      imageAlt: 'Calm facial treatment',
    },
    {
      id: 'spa',
      name: 'Hair Spa',
      price: 999,
      durationMinutes: 60,
      durationLabel: '60 min',
      description: 'Deep conditioning and repair for hair that has had enough of the city, sun, and heat.',
      image: '/images/service-spa.jpg',
      imageAlt: 'Relaxing hair spa setup',
    },
  ],
  testimonials: [
    {
      name: 'Rohan Kapoor',
      detail: 'Haircut · Bandra',
      quote: 'They asked how I comb it on a Monday, not just how I wanted it to look in the mirror. The cut still sits properly two weeks later.',
    },
    {
      name: 'Ananya Mehta',
      detail: 'Hair Coloring',
      quote: 'The room is calm, the colour is exact, and nobody tried to sell me a trend I did not ask for. I have already booked the next visit.',
    },
    {
      name: 'Vikram Shah',
      detail: 'Beard Styling',
      quote: 'Clean line, no rush, and the hot towel finish is the part I now refuse to skip. It feels like a private appointment, because it is.',
    },
    {
      name: 'Meera Iyer',
      detail: 'Hair Spa',
      quote: 'My hair had gone dull from the weather. One spa and it moved again. The stylist explained what they were using, without the lecture.',
    },
  ],
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
