import type { Invoice, Payment } from '../../domain/types.js';
import { daysBetween, type Day } from '../calendar/day-math.js';
import { isSettledAt, outstandingMinorAt } from './balance.js';

export type InvoiceStatus = 'paid' | 'partially_paid' | 'due' | 'overdue' | 'disputed';

/** The status shown in the invoice list of the app. */
export function invoiceStatusAt(invoice: Invoice, payments: Payment[], day: Day): InvoiceStatus {
  if (isSettledAt(invoice, payments, day)) return 'paid';
  if (invoice.disputed) return 'disputed';
  if (daysBetween(invoice.dueDate, day) > 0) return 'overdue';
  return outstandingMinorAt(invoice, payments, day) < invoice.totalMinor ? 'partially_paid' : 'due';
}

/** Calendar days past the due date at `day`, 0 when not yet due. */
export const daysPastDue = (invoice: Invoice, day: Day): number => Math.max(0, daysBetween(invoice.dueDate, day));
