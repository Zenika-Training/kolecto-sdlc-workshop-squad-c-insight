import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, isWeekend } from '../../src/billing/calendar/day-math.js';

describe('day-math', () => {
  it('counts calendar days across months', () => {
    expect(daysBetween('2026-10-31', '2026-11-20')).toBe(20);
    expect(daysBetween('2026-11-20', '2026-11-01')).toBe(-19);
  });
  it('adds days and knows weekends', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(isWeekend('2026-11-21')).toBe(true);
    expect(isWeekend('2026-11-20')).toBe(false);
  });
});
