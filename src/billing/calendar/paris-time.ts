import { BillingError } from '../shared/errors.js';
import type { Day } from './day-math.js';

/** Business time zone of Kolecto (ORG-03). */
export const PARIS = 'Europe/Paris';

/** Wall-clock parts of an instant in Paris. */
export interface ParisParts {
  day: Day;
  year: number;
  month: number;
  date: number;
  hour: number;
  minute: number;
  second: number;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const FORMAT = new Intl.DateTimeFormat('en-GB', {
  timeZone: PARIS, hourCycle: 'h23', weekday: 'short',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
});
const pad = (n: number) => String(n).padStart(2, '0');

export function parseInstant(iso: string): number {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) throw new BillingError('INVALID_INSTANT', `not an ISO 8601 instant: ${iso}`);
  return ms;
}

export function parisParts(ms: number): ParisParts {
  const o: Record<string, string> = {};
  for (const p of FORMAT.formatToParts(new Date(ms))) o[p.type] = p.value;
  const year = Number(o.year);
  const month = Number(o.month);
  const date = Number(o.day);
  return {
    day: `${year}-${pad(month)}-${pad(date)}`,
    year, month, date,
    hour: Number(o.hour), minute: Number(o.minute), second: Number(o.second),
    weekday: WEEKDAYS[o.weekday ?? ''] ?? 0,
  };
}

/** Offset of Paris from UTC at that instant, in minutes (+60 in winter, +120 in summer). */
export function parisOffsetMinutes(ms: number): number {
  const p = parisParts(ms);
  return Math.round((Date.UTC(p.year, p.month - 1, p.date, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000) / 60_000);
}

/** ISO 8601 in Paris time with its offset, seconds precision: `2026-11-20T09:00:00+01:00`. */
export function toParisIso(ms: number): string {
  const p = parisParts(ms);
  const off = parisOffsetMinutes(ms);
  const sign = off >= 0 ? '+' : '-';
  return `${p.day}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
}

/** The instant of a Paris wall-clock time on a given day (DST-safe: offset probed at noon). */
export function parisWallClock(day: Day, hour: number, minute = 0): number {
  const midnightUtc = Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)));
  const offset = parisOffsetMinutes(midnightUtc + 12 * 3_600_000);
  return midnightUtc + (hour * 60 + minute - offset) * 60_000;
}

/** The Paris calendar day of an instant. */
export const parisDay = (iso: string): Day => parisParts(parseInstant(iso)).day;
