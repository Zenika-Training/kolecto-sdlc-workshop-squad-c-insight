import type { Payment } from '../../domain/types.js';
import { daysBetween, type Day } from '../calendar/day-math.js';

/** A reminder that was actually sent, as recorded by the outbox. */
export interface SentReminder {
  invoiceId: string;
  sentDay: Day;
}

/**
 * Share of reminded invoices that received a payment within `windowDays` after the reminder.
 * Written for the finance dashboard; the payment-reminders programme reuses it to check its G1 promise.
 */
export function paidWithinRate(reminders: SentReminder[], payments: Payment[], windowDays = 7): number | null {
  if (reminders.length === 0) return null;
  const hits = reminders.filter((r) =>
    payments.some((p) => p.invoiceId === r.invoiceId && daysBetween(r.sentDay, p.date) >= 0 && daysBetween(r.sentDay, p.date) <= windowDays),
  ).length;
  return Math.round((hits / reminders.length) * 1000) / 10;
}
