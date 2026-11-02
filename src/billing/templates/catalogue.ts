import type { Locale } from '../money/format.js';

export interface MessageTemplate {
  subject: string;
  body: string;
}

/**
 * Templates owned by the finance team. Ids are stable: the support team quotes them.
 * Collection templates of the payment-reminders programme are not here yet: they belong to its contract.
 */
export const CATALOGUE: Record<string, Record<Locale, MessageTemplate>> = {
  'invoice-sent': {
    fr: { subject: 'Votre facture {invoiceNumber}', body: 'Bonjour {customerName},\n\nVeuillez trouver votre facture {invoiceNumber} d’un montant de {amount}, à régler avant le {dueDate}.' },
    en: { subject: 'Your invoice {invoiceNumber}', body: 'Hello {customerName},\n\nPlease find invoice {invoiceNumber} for {amount}, due on {dueDate}.' },
  },
  'payment-received': {
    fr: { subject: 'Paiement reçu pour la facture {invoiceNumber}', body: 'Bonjour {customerName},\n\nNous avons bien reçu {amount}. Merci.' },
    en: { subject: 'Payment received for invoice {invoiceNumber}', body: 'Hello {customerName},\n\nWe received {amount}. Thank you.' },
  },
  // dunning-v0: one text for every delay, downloaded and pasted by hand into a mailbox.
  'dunning-v0': {
    fr: { subject: 'Relance facture {invoiceNumber}', body: 'Bonjour {customerName},\n\nSauf erreur de notre part, la facture {invoiceNumber} est en retard de {daysLate} jours. Reste dû : {balance} EUR.' },
    en: { subject: 'Reminder: invoice {invoiceNumber}', body: 'Hello {customerName},\n\nInvoice {invoiceNumber} is {daysLate} days late. Balance: {balance} EUR.' },
  },
};
