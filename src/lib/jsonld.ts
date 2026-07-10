import type { Site } from '../config/site';

export function buildLocalBusinessJsonLd(site: Site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    image: new URL(site.logo, site.url).href,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: site.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: site.socials.map((s) => s.href),
  };
}
