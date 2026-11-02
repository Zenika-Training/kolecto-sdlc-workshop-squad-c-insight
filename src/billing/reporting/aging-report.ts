import type { Invoice, Payment } from '../../domain/types.js';
import type { Day } from '../calendar/day-math.js';
import { sum, type Minor } from '../money/cents.js';
import { outstandingMinorAt } from '../ledger/balance.js';
import { daysPastDue } from '../ledger/invoice-status.js';

export type Bucket = 'not_due' | '1-30' | '31-60' | '61-90' | '90+';

export const bucketOf = (days: number): Bucket =>
  days <= 0 ? 'not_due' : days <= 30 ? '1-30' : days <= 60 ? '31-60' : days <= 90 ? '61-90' : '90+';

/** Receivables aging: what is owed, by how late it is. Shown on the finance dashboard. */
export function agingReport(invoices: Invoice[], payments: Payment[], day: Day): Record<Bucket, Minor> {
  const report: Record<Bucket, Minor> = { not_due: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
  for (const invoice of invoices) {
    const open = outstandingMinorAt(invoice, payments, day);
    if (open > 0) report[bucketOf(daysPastDue(invoice, day))] += open;
  }
  return report;
}

export const totalReceivables = (report: Record<Bucket, Minor>): Minor => sum(Object.values(report));
