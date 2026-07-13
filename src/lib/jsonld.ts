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
    areaServed: site.serviceAreas.map((area) => ({
      '@type': 'City',
      name: area,
    })),
    openingHoursSpecification: site.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: site.socials.map((s) => s.href),
  };
}

export function buildBlogPostingJsonLd(opts: {
  site: Site;
  title: string;
  description?: string;
  datePublished: Date;
  dateModified?: Date;
  url: string;
  image?: string;
}) {
  const { site, title, description, datePublished, dateModified, url, image } = opts;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    ...(description ? { description } : {}),
    datePublished: datePublished.toISOString(),
    dateModified: (dateModified ?? datePublished).toISOString(),
    ...(image ? { image: [image] } : {}),
    author: { '@type': 'Organization', name: site.name, url: site.url },
    publisher: {
      '@type': 'Organization',
      name: site.legalName,
      logo: { '@type': 'ImageObject', url: new URL(site.logo, site.url).href },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}
