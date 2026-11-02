import { readFileSync } from 'node:fs';
import type { Customer, Invoice, Payment } from './domain/types.js';

/** Synthetic pilot dataset (copied from the Context Nexus: programme/payment-reminders/data/). Reference day: 2026-11-20. */
const load = <T>(name: string): T => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8')) as T;

export const customers = (): Customer[] => load<Customer[]>('customers');
export const invoices = (): Invoice[] => load<Invoice[]>('invoices');
export const payments = (): Payment[] => load<Payment[]>('payments');
