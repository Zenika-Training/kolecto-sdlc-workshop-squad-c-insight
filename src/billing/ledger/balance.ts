import type { Invoice, Payment } from '../../domain/types.js';
import { clampToZero, subtract, sum, toEuros, type Minor } from '../money/cents.js';
import type { Day } from '../calendar/day-math.js';
import { InvoiceRepository } from './invoice-repository.js';
import { PaymentRepository } from './payment-repository.js';

/**
 * What the customer still owes on an invoice at the end of `day`, in cents:
 * total minus the payments dated on or before `day`. Never negative (overpayments are refunded, BILL-70).
 * Pure: give it the invoice and its payments, it does no I/O.
 */
export function outstandingMinorAt(invoice: Invoice, payments: Payment[], day: Day): Minor {
  const paid = sum(payments.filter((p) => p.invoiceId === invoice.id && p.date <= day).map((p) => p.amountMinor));
  return clampToZero(subtract(invoice.totalMinor, paid));
}

/** Same as `outstandingMinorAt`, but signed: negative when the customer paid too much. */
export function signedBalanceMinorAt(invoice: Invoice, payments: Payment[], day: Day): Minor {
  const paid = sum(payments.filter((p) => p.invoiceId === invoice.id && p.date <= day).map((p) => p.amountMinor));
  return subtract(invoice.totalMinor, paid);
}

export const isSettledAt = (invoice: Invoice, payments: Payment[], day: Day): boolean =>
  signedBalanceMinorAt(invoice, payments, day) <= 0;

/**
 * @deprecated Since BILL-88. Returns euros as a float and counts every payment, including
 * the ones dated in the future. Kept for `dunning-v0`. Use `outstandingMinorAt`.
 */
export function getBalance(invoiceId: string, invoices = new InvoiceRepository(), payments = new PaymentRepository()): number {
  const invoice = invoices.get(invoiceId);
  const paid = sum(payments.forInvoice(invoiceId).map((p) => p.amountMinor));
  return toEuros(invoice.totalMinor - paid);
}
