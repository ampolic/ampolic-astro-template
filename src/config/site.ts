export interface Site {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  logo: string;
  email: string;
  phone: string;
  address: { street: string; locality: string; region: string; postalCode: string; country: string };
  geo: { lat: number; lng: number };
  hours: Array<{ days: string; opens: string; closes: string }>;
  nav: Array<{ label: string; href: string }>;
  socials: Array<{ label: string; href: string; icon: string }>;
  analytics: { provider: 'none' | 'plausible' | 'ga'; id?: string };
  form: { endpoint: string; turnstileSiteKey: string; recipientLabel: string };
}

export const site: Site = {
  name: 'Summit Heating & Air',
  legalName: 'Summit Heating & Air LLC',
  tagline: 'Comfort you can count on, all year round.',
  description:
    'Licensed HVAC service for the greater Boulder area — AC repair & install, furnace and heating, and indoor air quality.',
  url: 'https://example.com',
  logo: '/favicon.svg',
  email: 'hello@summithvac.example',
  phone: '+1-303-555-0142',
  address: { street: '1420 Pearl St', locality: 'Boulder', region: 'CO', postalCode: '80302', country: 'US' },
  geo: { lat: 40.019, lng: -105.278 },
  hours: [
    { days: 'Mon–Fri', opens: '07:30', closes: '18:00' },
    { days: 'Sat', opens: '08:00', closes: '14:00' },
  ],
  nav: [
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  socials: [
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'lucide:facebook' },
    { label: 'Instagram', href: 'https://instagram.com/', icon: 'lucide:instagram' },
  ],
  analytics: { provider: 'none' },
  form: { endpoint: '/api/contact', turnstileSiteKey: '1x00000000000000000000AA', recipientLabel: 'the Summit team' },
};

export default site;
