/** Shapes of the pilot dataset (programme/payment-reminders/data/). Amounts are integer minor units (cents). */

export interface Customer {
  id: string;
  name: string;
  type: 'B2B' | 'B2C';
  language: 'fr' | 'en';
  optedOut: boolean;
  email: string;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  totalMinor: number;
  currency: 'EUR';
  disputed: boolean;
}

export interface Payment {
  id: string;
  invoiceId: string;
  date: string; // YYYY-MM-DD
  amountMinor: number;
}
