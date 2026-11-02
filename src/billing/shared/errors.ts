/** Errors raised by Core Billing. `code` is stable and safe to log (no personal data). */
export class BillingError extends Error {
  constructor(
    readonly code: 'INVOICE_NOT_FOUND' | 'CUSTOMER_NOT_FOUND' | 'INVALID_DAY' | 'INVALID_INSTANT' | 'CURRENCY_MISMATCH' | 'TEMPLATE_NOT_FOUND' | 'MISSING_PLACEHOLDER',
    message: string,
  ) {
    super(message);
    this.name = 'BillingError';
  }
}

export const invariant = (condition: unknown, code: BillingError['code'], message: string): void => {
  if (!condition) throw new BillingError(code, message);
};
