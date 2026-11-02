import { addDays, type Day } from '../calendar/day-math.js';
import { isBusinessDay, nextBusinessDay } from '../calendar/business-days.js';

/** Payment terms offered in the app. The legal maximum between businesses is 60 days (LME). */
export type PaymentTerms = 'on_receipt' | 'net_15' | 'net_30' | 'net_45' | 'net_60';

const DAYS: Record<PaymentTerms, number> = { on_receipt: 0, net_15: 15, net_30: 30, net_45: 45, net_60: 60 };

/** Due date from the issue date. A due date on a weekend or public holiday moves to the next business day (BILL-41). */
export function dueDate(issueDate: Day, terms: PaymentTerms): Day {
  const raw = addDays(issueDate, DAYS[terms]);
  return isBusinessDay(raw) ? raw : nextBusinessDay(raw);
}
