import { BillingError } from '../shared/errors.js';

/** Kolecto invoices in euros only (BILL-12). Kept as a type so a second currency is a compile error first. */
export type Currency = 'EUR';

export const DEFAULT_CURRENCY: Currency = 'EUR';

export function assertSameCurrency(a: string, b: string): void {
  if (a !== b) throw new BillingError('CURRENCY_MISMATCH', `cannot combine ${a} and ${b}`);
}
