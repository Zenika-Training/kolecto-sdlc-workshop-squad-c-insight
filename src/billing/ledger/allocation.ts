import type { Invoice, Payment } from '../../domain/types.js';
import type { Minor } from '../money/cents.js';
import type { Day } from '../calendar/day-math.js';
import { outstandingMinorAt } from './balance.js';

export interface Allocation {
  invoiceId: string;
  amountMinor: Minor;
}

/**
 * Spreads an unassigned customer transfer over their open invoices, oldest due date first (BILL-74).
 * Returns what goes where and the leftover (credit on account).
 */
export function allocateTransfer(amountMinor: Minor, openInvoices: Invoice[], payments: Payment[], day: Day): { allocations: Allocation[]; leftoverMinor: Minor } {
  const ordered = [...openInvoices].sort((a, b) => (a.dueDate === b.dueDate ? a.number.localeCompare(b.number) : a.dueDate < b.dueDate ? -1 : 1));
  let left = amountMinor;
  const allocations: Allocation[] = [];
  for (const invoice of ordered) {
    if (left <= 0) break;
    const open = outstandingMinorAt(invoice, payments, day);
    if (open <= 0) continue;
    const take = Math.min(open, left);
    allocations.push({ invoiceId: invoice.id, amountMinor: take });
    left -= take;
  }
  return { allocations, leftoverMinor: left };
}
