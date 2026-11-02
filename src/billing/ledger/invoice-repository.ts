import { invoices as loadInvoices } from '../../data.js';
import type { Invoice } from '../../domain/types.js';
import { BillingError } from '../shared/errors.js';

/** Read access to issued invoices. Drafts are not in the ledger. */
export class InvoiceRepository {
  private readonly byId: Map<string, Invoice>;

  constructor(all: Invoice[] = loadInvoices()) {
    this.byId = new Map(all.map((i) => [i.id, i]));
  }

  find(id: string): Invoice | undefined {
    return this.byId.get(id);
  }

  get(id: string): Invoice {
    const i = this.byId.get(id);
    if (!i) throw new BillingError('INVOICE_NOT_FOUND', `invoice ${id} not found`);
    return i;
  }

  findByNumber(number: string): Invoice | undefined {
    return this.all().find((i) => i.number === number);
  }

  all(): Invoice[] {
    return [...this.byId.values()];
  }

  forCustomer(customerId: string): Invoice[] {
    return this.all().filter((i) => i.customerId === customerId);
  }
}
