/**
 * Invoice numbers: `F-<year>-<sequence>`, continuous and without gaps per year (French law).
 * Credit notes use `A-<year>-<sequence>`.
 */
export type DocumentKind = 'invoice' | 'credit_note';

const PREFIX: Record<DocumentKind, string> = { invoice: 'F', credit_note: 'A' };

export function formatNumber(kind: DocumentKind, year: number, sequence: number): string {
  return `${PREFIX[kind]}-${year}-${String(sequence).padStart(4, '0')}`;
}

export function parseNumber(number: string): { kind: DocumentKind; year: number; sequence: number } | null {
  const m = /^([FA])-(\d{4})-(\d{4,})$/.exec(number);
  if (!m) return null;
  return { kind: m[1] === 'F' ? 'invoice' : 'credit_note', year: Number(m[2]), sequence: Number(m[3]) };
}

/** Next number for a year, given the numbers already issued. */
export function nextNumber(kind: DocumentKind, year: number, issued: string[]): string {
  const last = issued
    .map(parseNumber)
    .filter((n): n is NonNullable<typeof n> => n !== null && n.kind === kind && n.year === year)
    .reduce((max, n) => Math.max(max, n.sequence), 0);
  return formatNumber(kind, year, last + 1);
}
