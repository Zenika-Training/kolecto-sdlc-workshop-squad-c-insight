import { customers as loadCustomers } from '../../data.js';
import type { Customer } from '../../domain/types.js';
import { BillingError } from '../shared/errors.js';

/** Read access to customers. In production this is the `customers` table; here, the pilot dataset. */
export class CustomerRepository {
  private readonly byId: Map<string, Customer>;

  constructor(all: Customer[] = loadCustomers()) {
    this.byId = new Map(all.map((c) => [c.id, c]));
  }

  find(id: string): Customer | undefined {
    return this.byId.get(id);
  }

  get(id: string): Customer {
    const c = this.byId.get(id);
    if (!c) throw new BillingError('CUSTOMER_NOT_FOUND', `customer ${id} not found`);
    return c;
  }

  all(): Customer[] {
    return [...this.byId.values()];
  }

  businesses(): Customer[] {
    return this.all().filter((c) => c.type === 'B2B');
  }
}
