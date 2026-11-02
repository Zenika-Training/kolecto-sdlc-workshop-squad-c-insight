import type { Customer, Invoice } from '../../domain/types.js';
import { daysLate, type Day } from '../calendar/day-math.js';
import { getBalance } from '../ledger/balance.js';
import { InvoiceRepository } from '../ledger/invoice-repository.js';
import { PaymentRepository } from '../ledger/payment-repository.js';
import { CustomerRepository } from '../customers/customer-repository.js';
import { contactLanguage, displayName } from '../customers/preferences.js';
import { renderMessage } from '../templates/renderer.js';
import { auditLog } from '../audit/audit-log.js';
import { toCsv } from '../exports/csv.js';

/** One line of the Monday export, as finance pastes it into their mailbox. */
export interface ManualReminderLine {
  invoiceNumber: string;
  customerName: string;
  email: string;
  /** Days since the due date. The field name comes from the old dunning screen. */
  daysLate: number;
  /** Euros, float (BILL-88 never migrated this export). */
  balance: number;
  subject: string;
  body: string;
}

/**
 * dunning-v0 · the manual chasing export (2019). Every overdue invoice with a balance, one text for every delay,
 * no business-day logic, no fees, no opt-out. To be retired by the payment-reminders programme.
 */
export function manualReminderLines(today: Day, invoices = new InvoiceRepository(), payments = new PaymentRepository(), customers = new CustomerRepository()): ManualReminderLine[] {
  const lines: ManualReminderLine[] = [];
  for (const invoice of invoices.all()) {
    const late = daysLate(invoice.dueDate, today);
    const balance = getBalance(invoice.id, invoices, payments);
    if (late <= 0 || balance <= 0) continue;
    const customer: Customer = customers.get(invoice.customerId);
    lines.push(toLine(invoice, customer, late, balance));
  }
  auditLog.record({ at: `${today}T00:00:00+00:00`, actor: 'finance', action: 'dunning.exported', objectId: `dunning-${today}`, details: { lines: lines.length } });
  return lines;
}

function toLine(invoice: Invoice, customer: Customer, late: number, balance: number): ManualReminderLine {
  const message = renderMessage('dunning-v0', contactLanguage(customer), {
    invoiceNumber: invoice.number,
    customerName: displayName(customer),
    daysLate: late,
    balance: balance.toFixed(2),
  });
  return { invoiceNumber: invoice.number, customerName: displayName(customer), email: customer.email, daysLate: late, balance, ...message };
}

export function manualReminderCsv(today: Day): string {
  return toCsv(
    ['invoice', 'customer', 'email', 'days_late', 'balance_eur', 'subject'],
    manualReminderLines(today).map((l) => [l.invoiceNumber, l.customerName, l.email, l.daysLate, l.balance.toFixed(2), l.subject]),
  );
}
