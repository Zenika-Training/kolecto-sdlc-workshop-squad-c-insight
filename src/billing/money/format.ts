import type { Minor } from './cents.js';
import type { Currency } from './currency.js';

export type Locale = 'fr' | 'en';

const FORMATTERS: Record<Locale, Intl.NumberFormat> = {
  fr: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }),
  en: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }),
};

/** "1 234,56 €" in French, "€1,234.56" in English. For display only, never for computation. */
export function formatAmount(amount: Minor, locale: Locale, currency: Currency = 'EUR'): string {
  void currency; // single currency for now (BILL-12)
  return FORMATTERS[locale].format(amount / 100);
}

/** Plain "1234.56", the format of the accounting export (dot, two decimals, no symbol). */
export function formatPlain(amount: Minor): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
