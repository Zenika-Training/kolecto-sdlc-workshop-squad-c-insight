import { percentOf, sum, type Minor } from '../money/cents.js';

/** French VAT rates, in percent. */
export const VAT_RATES = { standard: 20, intermediate: 10, reduced: 5.5, super_reduced: 2.1, exempt: 0 } as const;
export type VatRate = keyof typeof VAT_RATES;

export interface InvoiceLine {
  label: string;
  quantity: number;
  unitPriceMinor: Minor;
  vat: VatRate;
}

export const lineNetMinor = (line: InvoiceLine): Minor => line.quantity * line.unitPriceMinor;

/** VAT is computed per rate on the sum of the lines, then rounded (BILL-19), not per line. */
export function vatByRate(lines: InvoiceLine[]): Partial<Record<VatRate, Minor>> {
  const out: Partial<Record<VatRate, Minor>> = {};
  for (const rate of Object.keys(VAT_RATES) as VatRate[]) {
    const base = sum(lines.filter((l) => l.vat === rate).map(lineNetMinor));
    if (base > 0) out[rate] = percentOf(base, VAT_RATES[rate]);
  }
  return out;
}

export function totals(lines: InvoiceLine[]): { netMinor: Minor; vatMinor: Minor; totalMinor: Minor } {
  const netMinor = sum(lines.map(lineNetMinor));
  const vatMinor = sum(Object.values(vatByRate(lines)));
  return { netMinor, vatMinor, totalMinor: netMinor + vatMinor };
}
