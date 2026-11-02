import { describe, expect, it } from 'vitest';
import { nextBusinessSlot } from '../../src/billing/calendar/business-days.js';
import { toParisIso } from '../../src/billing/calendar/paris-time.js';

describe('business-days', () => {
  it('keeps an instant inside office hours', () => {
    expect(nextBusinessSlot('2026-11-20T10:15:00+01:00')).toBe('2026-11-20T10:15:00+01:00');
  });
  it('moves a Friday evening to Monday 09:00', () => {
    expect(nextBusinessSlot('2026-11-20T18:30:00+01:00')).toBe('2026-11-23T09:00:00+01:00');
  });
  it('writes Paris time with the summer offset', () => {
    expect(toParisIso(Date.parse('2026-07-01T10:00:00Z'))).toBe('2026-07-01T12:00:00+02:00');
  });
});
