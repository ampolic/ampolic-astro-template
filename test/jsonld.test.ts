import { describe, it, expect } from 'vitest';
import { buildLocalBusinessJsonLd } from '../src/lib/jsonld';
import { site } from '../src/config/site';

describe('LocalBusiness JSON-LD', () => {
  const ld = buildLocalBusinessJsonLd(site);
  it('declares the LocalBusiness type and name', () => {
    expect(ld['@type']).toBe('LocalBusiness');
    expect(ld.name).toBe(site.name);
  });
  it('maps address and geo', () => {
    expect(ld.address.streetAddress).toBe(site.address.street);
    expect(ld.geo.latitude).toBe(site.geo.lat);
  });
  it('emits one openingHoursSpecification per hours row', () => {
    expect(ld.openingHoursSpecification).toHaveLength(site.hours.length);
  });
  it('lists socials under sameAs', () => {
    expect(ld.sameAs).toEqual(site.socials.map((s) => s.href));
  });
});
