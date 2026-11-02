import type { Minor } from '../money/cents.js';
import { sum } from '../money/cents.js';
import type { Day } from '../calendar/day-math.js';

/** A credit note reduces what the customer owes on one invoice (BILL-63). */
export interface CreditNote {
  id: string;
  invoiceId: string;
  date: Day;
  amountMinor: Minor;
  reason: 'commercial_gesture' | 'billing_error' | 'return';
}

/** No credit note in the pilot dataset: the repository starts empty. */
export class CreditNoteRepository {
  constructor(private readonly notes: CreditNote[] = []) {}

  forInvoiceUntil(invoiceId: string, day: Day): CreditNote[] {
    return this.notes.filter((n) => n.invoiceId === invoiceId && n.date <= day);
  }

  totalForInvoiceUntil(invoiceId: string, day: Day): Minor {
    return sum(this.forInvoiceUntil(invoiceId, day).map((n) => n.amountMinor));
  }
}
