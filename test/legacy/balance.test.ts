import { describe, expect, it } from 'vitest';
import { outstandingMinorAt } from '../../src/billing/ledger/balance.js';
import type { Invoice } from '../../src/domain/types.js';

const invoice: Invoice = { id: 'i1', number: 'F-2026-9999', customerId: 'C01', issueDate: '2026-10-01', dueDate: '2026-10-31', totalMinor: 10000, currency: 'EUR', disputed: false };

describe('balance', () => {
  it('subtracts the payments of the invoice', () => {
    expect(outstandingMinorAt(invoice, [{ id: 'p', invoiceId: 'i1', date: '2026-11-02', amountMinor: 2500 }], '2026-11-20')).toBe(7500);
  });
  it('never goes below zero', () => {
    expect(outstandingMinorAt(invoice, [{ id: 'p', invoiceId: 'i1', date: '2026-11-02', amountMinor: 12000 }], '2026-11-20')).toBe(0);
  });
});
