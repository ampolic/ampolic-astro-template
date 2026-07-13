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
  it('emits dayOfWeek as an array of valid schema.org day names', () => {
    const validDayNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    ld.openingHoursSpecification.forEach((spec, i) => {
      expect(Array.isArray(spec.dayOfWeek)).toBe(true);
      expect(spec.dayOfWeek).toEqual(site.hours[i].dayOfWeek);
      spec.dayOfWeek.forEach((day) => {
        expect(validDayNames).toContain(day);
      });
    });
    expect(ld.openingHoursSpecification[0].dayOfWeek[0]).toBe('Monday');
  });
  it('lists socials under sameAs', () => {
    expect(ld.sameAs).toEqual(site.socials.map((s) => s.href));
  });
  it('emits one areaServed City per configured service area', () => {
    expect(ld.areaServed).toHaveLength(site.serviceAreas.length);
    expect(ld.areaServed.map((a) => a.name)).toEqual(site.serviceAreas);
    ld.areaServed.forEach((a) => expect(a['@type']).toBe('City'));
  });
});
