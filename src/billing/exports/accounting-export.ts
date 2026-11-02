import type { Invoice, Payment } from '../../domain/types.js';
import type { Day } from '../calendar/day-math.js';
import { formatPlain } from '../money/format.js';
import { simpleInterest } from '../money/cents.js';
import { outstandingMinorAt } from '../ledger/balance.js';
import { daysPastDue } from '../ledger/invoice-status.js';
import { auditLog } from '../audit/audit-log.js';
import { toCsv } from './csv.js';

/** Late-interest provision rate used by the accountants (not the rate invoiced to customers). */
export const PROVISION_RATE_PERCENT = 10;

/**
 * Monthly receivables export for the accounting firm: one line per open invoice at `day`,
 * with the provision for late interest. Changing `outstandingMinorAt` changes this file.
 */
export function receivablesExport(invoices: Invoice[], payments: Payment[], day: Day): string {
  const rows = invoices
    .map((i) => ({ i, open: outstandingMinorAt(i, payments, day), late: daysPastDue(i, day) }))
    .filter((r) => r.open > 0)
    .map((r) => [r.i.number, r.i.customerId, r.i.dueDate, formatPlain(r.open), r.late, formatPlain(simpleInterest(r.open, PROVISION_RATE_PERCENT, r.late))]);
  auditLog.record({ at: `${day}T00:00:00+00:00`, actor: 'system', action: 'export.generated', objectId: `receivables-${day}`, details: { lines: rows.length } });
  return toCsv(['invoice', 'customer', 'due_date', 'outstanding', 'days_past_due', 'interest_provision'], rows);
}
