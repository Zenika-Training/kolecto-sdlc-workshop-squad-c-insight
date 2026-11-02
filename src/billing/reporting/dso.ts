import type { Invoice, Payment } from '../../domain/types.js';
import { daysBetween, type Day } from '../calendar/day-math.js';

/**
 * Average payment delay in days, over invoices fully paid on or before `day`: the number the
 * payment-reminders programme promises to lower. Payment date = date of the last payment.
 */
export function averagePaymentDelay(invoices: Invoice[], payments: Payment[], day: Day): number | null {
  const delays: number[] = [];
  for (const invoice of invoices) {
    const own = payments.filter((p) => p.invoiceId === invoice.id && p.date <= day).sort((a, b) => (a.date < b.date ? -1 : 1));
    const paid = own.reduce((total, p) => total + p.amountMinor, 0);
    const last = own.at(-1);
    if (last && paid >= invoice.totalMinor) delays.push(daysBetween(invoice.dueDate, last.date));
  }
  return delays.length ? Math.round((delays.reduce((a, b) => a + b, 0) / delays.length) * 10) / 10 : null;
}
