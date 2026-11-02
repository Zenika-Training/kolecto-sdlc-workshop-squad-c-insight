import { payments as loadPayments } from '../../data.js';
import type { Payment } from '../../domain/types.js';
import type { Day } from '../calendar/day-math.js';

/**
 * Payments as booked by the bank reconciliation. A payment can be booked with a value date
 * in the future (scheduled transfers): always filter by date when you compute a balance.
 */
export class PaymentRepository {
  constructor(private readonly payments: Payment[] = loadPayments()) {}

  all(): Payment[] {
    return [...this.payments];
  }

  forInvoice(invoiceId: string): Payment[] {
    return this.payments.filter((p) => p.invoiceId === invoiceId);
  }

  /** Payments of the invoice with a value date on or before `day`. */
  forInvoiceUntil(invoiceId: string, day: Day): Payment[] {
    return this.forInvoice(invoiceId).filter((p) => p.date <= day);
  }
}
