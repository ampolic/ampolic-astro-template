/* Blog share targets. 'native' = device share sheet, 'copy' = copy link —
   both are JS-only and hidden when unsupported. The rest are plain intent links. */
export type ShareTarget =
  | 'native'
  | 'copy'
  | 'x'
  | 'facebook'
  | 'linkedin'
  | 'bluesky'
  | 'threads'
  | 'whatsapp'
  | 'telegram'
  | 'reddit'
  | 'pinterest'
  | 'email'
  | 'sms';

export interface Site {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  /* Primary offering, used to build the homepage <title> ("[primaryService] in [city] | [name]")
     and AI-search summaries. Keep short and human, e.g. "HVAC Service". */
  primaryService: string;
  /* Marketing city for SEO titles + homepage copy. Keep in sync with address.locality. */
  city: string;
  url: string;
  logo: string;
  email: string;
  phone: string;
  address: { street: string; locality: string; region: string; postalCode: string; country: string };
  geo: { lat: number; lng: number };
  /* Plain-language service area, e.g. for the contact-page map caption. */
  serviceArea: string;
  /* Towns/neighbourhoods served. Rendered as the footer "Serving:" line and injected
     into LocalBusiness JSON-LD as areaServed. First entry should be the primary city. */
  serviceAreas: string[];
  hours: Array<{ days: string; dayOfWeek: string[]; opens: string; closes: string }>;
  nav: Array<{ label: string; href: string }>;
  /* Primary conversion action, reused in the nav and hero. */
  cta: { label: string; href: string };
  socials: Array<{ label: string; href: string; icon: string }>;
  /* Which share targets appear on blog posts, in render order. Full menu:
     native, copy, x, facebook, linkedin, bluesky, threads, whatsapp,
     telegram, reddit, pinterest, email, sms. */
  shareLinks: ShareTarget[];
  analytics: { provider: 'none' | 'plausible' | 'ga'; id?: string };
  form: { endpoint: string; turnstileSiteKey: string; recipientLabel: string };
  /* Credibility facts rendered as the mono spec strip (est · rating · license · dispatch). */
  trust: { established: number; ratingValue: number; reviewCount: number; license: string; dispatch: string };
  /* E-E-A-T author/credential slots rendered on the about page (and licenses in the footer).
     Owner photo is optional — omit for an initials avatar. Licenses/certifications may be empty. */
  credentials: {
    owner: { name: string; title: string; photo?: string };
    licenses: string[];
    certifications: string[];
  };
  /* Literal colors for build-time OG social cards. Satori needs concrete values;
     keep these in sync with the corresponding @theme tokens in global.css. */
  og: { bg: string; fg: string; brand: string };
  /* Privacy/terms config. Drives the /privacy and /terms pages; see the Legal type. */
  legal: Legal;
  /* Discreet agency attribution in the footer + humans.txt. `enabled` is a
     per-client agreement (see docs/CLIENT-SETUP.md) — off means no credit renders. */
  credit: { enabled: boolean; name: string; url: string };
}

/* Legal/privacy config. Feeds the /privacy and /terms pages. Values here are template
   placeholders — the client is responsible for reviewing both pages with counsel. */
export interface Legal {
  /* Registered entity name used in policy documents. Mirror of `legalName`; keep in sync. */
  businessLegalName: string;
  /* Address where privacy/legal requests are received. Usually the same as `email`. */
  contactEmail: string;
  /* Date the current policy text takes effect. CLIENT MUST SET before launch. */
  effectiveDate: string;
  /* Date the accessibility statement was last reviewed against the live site.
     Shown on /accessibility. Re-check and bump this whenever UI changes. */
  lastReviewed: string;
  /* Service that receives contact-form submissions — named and linked in the privacy policy. */
  formProcessor: { name: string; privacyUrl: string };
  /* Analytics vendor name shown in the privacy policy, or null when no analytics runs.
     Default null: the template ships zero analytics. Set the name AND wire the tag together. */
  analyticsProvider: string | null;
  /* Optional raw <script> markup for a cookieless/self-hosted analytics tag, injected in <head>.
     null = nothing injected. Not used by the default template. */
  analyticsSnippet: string | null;
  /* Governing-law / jurisdiction placeholder for the terms page. CLIENT MUST SET. */
  jurisdictionNote: string;
}

export const site: Site = {
  name: 'Summit Heating & Air',
  legalName: 'Summit Heating & Air LLC',
  tagline: 'Comfort, engineered.',
  description:
    'Licensed HVAC service for the greater Boulder area: AC repair and installation, furnace and heating, and indoor air quality.',
  primaryService: 'HVAC Service',
  city: 'Boulder',
  url: 'https://example.com',
  logo: '/favicon.svg',
  email: 'hello@summithvac.example',
  phone: '+1-303-555-0142',
  address: { street: '1420 Pearl St', locality: 'Boulder', region: 'CO', postalCode: '80302', country: 'US' },
  geo: { lat: 40.019, lng: -105.278 },
  serviceArea: 'the greater Boulder area and Front Range',
  serviceAreas: ['Boulder', 'Longmont', 'Louisville', 'Lafayette', 'Superior', 'Erie', 'Niwot', 'Gunbarrel'],
  hours: [
    {
      days: 'Mon-Fri',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:30',
      closes: '18:00',
    },
    { days: 'Sat', dayOfWeek: ['Saturday'], opens: '08:00', closes: '14:00' },
  ],
  nav: [
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  cta: { label: 'Get a quote', href: '/contact' },
  socials: [
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'lucide:facebook' },
    { label: 'Instagram', href: 'https://instagram.com/', icon: 'lucide:instagram' },
  ],
  shareLinks: ['native', 'copy', 'facebook', 'whatsapp', 'x', 'email'],
  analytics: { provider: 'none' },
  form: { endpoint: '/api/contact', turnstileSiteKey: '1x00000000000000000000AA', recipientLabel: 'the Summit team' },
  trust: { established: 2009, ratingValue: 4.9, reviewCount: 312, license: 'EA-4471', dispatch: '24/7 dispatch' },
  credentials: {
    owner: { name: 'Dave Sorenson', title: 'Founder & Master Technician' },
    /* License statement for the about page. The bare number also appears as trust.license
       on the homepage spec strip — keep the two in sync. */
    licenses: ['Colorado Master HVAC Contractor #EA-4471', 'Licensed & insured in Boulder County'],
    certifications: ['NATE-certified technicians', 'EPA 608 Universal certification'],
  },
  og: { bg: '#0b1413', fg: '#f4f8f7', brand: '#2dd4bf' },
  legal: {
    businessLegalName: 'Summit Heating & Air LLC',
    contactEmail: 'hello@summithvac.example',
    effectiveDate: '2026-07-12',
    lastReviewed: '2026-07-12',
    /* Submissions post to the first-party /api/contact function, which delivers email via Resend.
       Point this at whatever service actually handles the client's form. */
    formProcessor: { name: 'Resend', privacyUrl: 'https://resend.com/legal/privacy-policy' },
    analyticsProvider: null,
    analyticsSnippet: null,
    jurisdictionNote: 'the State of Colorado, United States',
  },
  credit: { enabled: true, name: 'Ampolic Digital Solutions', url: 'https://ampolic.com' },
};

export default site;
