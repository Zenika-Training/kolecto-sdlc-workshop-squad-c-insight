import { addDays, isWeekend, type Day } from './day-math.js';
import { FRENCH_PUBLIC_HOLIDAYS, isPublicHoliday } from './holidays-fr.js';
import { parisParts, parisWallClock, parseInstant, toParisIso } from './paris-time.js';

export interface BusinessHours {
  /** First hour of the window, included. */
  openHour: number;
  /** Hour the window closes, excluded. */
  closeHour: number;
  holidays?: readonly Day[];
}

/** Kolecto office hours, also used by the support team. */
export const OFFICE_HOURS: BusinessHours = { openHour: 9, closeHour: 18 };

export const isBusinessDay = (day: Day, holidays: readonly Day[] = FRENCH_PUBLIC_HOLIDAYS): boolean =>
  !isWeekend(day) && !isPublicHoliday(day, holidays);

export function nextBusinessDay(day: Day, holidays: readonly Day[] = FRENCH_PUBLIC_HOLIDAYS): Day {
  let d = addDays(day, 1);
  while (!isBusinessDay(d, holidays)) d = addDays(d, 1);
  return d;
}

/** Adds business days (used for due dates: "30 days end of month" is not supported, BILL-41). */
export function addBusinessDays(day: Day, count: number, holidays: readonly Day[] = FRENCH_PUBLIC_HOLIDAYS): Day {
  let d = day;
  for (let i = 0; i < count; i += 1) d = nextBusinessDay(d, holidays);
  return d;
}

/**
 * The first instant at or after `nowIso` that falls inside business hours, in Paris time.
 * Inside the window: now. Before opening on a business day: opening time that day. Otherwise:
 * opening time on the next business day. Returns ISO 8601 with the Paris offset.
 */
export function nextBusinessSlot(nowIso: string, hours: BusinessHours = OFFICE_HOURS): string {
  const holidays = hours.holidays ?? FRENCH_PUBLIC_HOLIDAYS;
  const ms = parseInstant(nowIso);
  const p = parisParts(ms);
  const open = isBusinessDay(p.day, holidays);
  if (open && p.hour >= hours.openHour && p.hour < hours.closeHour) return toParisIso(ms);
  const day = open && p.hour < hours.openHour ? p.day : nextBusinessDay(p.day, holidays);
  return toParisIso(parisWallClock(day, hours.openHour));
}
