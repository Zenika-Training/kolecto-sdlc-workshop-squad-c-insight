import { BillingError } from '../shared/errors.js';

/** A calendar day, `YYYY-MM-DD`. Days have no time zone: they are what the invoice says. */
export type Day = string;

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

export function assertDay(value: string): Day {
  if (!DAY.test(value)) throw new BillingError('INVALID_DAY', `not a YYYY-MM-DD day: ${value}`);
  return value;
}

/** Days since 1970-01-01, for arithmetic only. */
export const dayNumber = (day: Day): number =>
  Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10))) / MS_PER_DAY;

export const fromDayNumber = (n: number): Day => new Date(n * MS_PER_DAY).toISOString().slice(0, 10);

/** Calendar days from `from` to `to`; negative when `to` is before `from`. */
export const daysBetween = (from: Day, to: Day): number => dayNumber(to) - dayNumber(from);

export const addDays = (day: Day, days: number): Day => fromDayNumber(dayNumber(day) + days);

export const isBefore = (a: Day, b: Day): boolean => a < b;

export const isOnOrBefore = (a: Day, b: Day): boolean => a <= b;

/** 0 = Sunday … 6 = Saturday. */
export const weekday = (day: Day): number => new Date(dayNumber(day) * MS_PER_DAY).getUTCDay();

export const isWeekend = (day: Day): boolean => weekday(day) === 0 || weekday(day) === 6;

/** @deprecated Named after the old dunning screen. Use `daysBetween(dueDate, today)` and clamp at 0. */
export const daysLate = (dueDate: Day, today: Day): number => Math.max(0, daysBetween(dueDate, today));
