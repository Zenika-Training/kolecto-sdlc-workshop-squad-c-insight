import type { Customer } from '../../domain/types.js';
import type { Locale } from '../money/format.js';

/** Language for any message to the customer. Unknown values fall back to French (BILL-57). */
export const contactLanguage = (customer: Customer): Locale => (customer.language === 'en' ? 'en' : 'fr');

/** Whether marketing and collection messages may be sent. Invoices themselves are always sent. */
export const acceptsCollectionMessages = (customer: Customer): boolean => !customer.optedOut;

export const isBusiness = (customer: Customer): boolean => customer.type === 'B2B';

/** Display name for documents: the legal name, never the e-mail. */
export const displayName = (customer: Customer): string => customer.name.trim();
