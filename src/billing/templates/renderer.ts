import type { Locale } from '../money/format.js';
import { BillingError } from '../shared/errors.js';
import { CATALOGUE, type MessageTemplate } from './catalogue.js';
import { fill } from './placeholders.js';

/**
 * Replaces every `{name}` with its value. A missing value is an error, never an empty string:
 * a customer must never read "{invoiceNumber}" or a blank where an amount should be.
 */
export function renderText(template: string, values: Record<string, string | number>): string {
  return fill(template, values, (name) => {
    throw new BillingError('MISSING_PLACEHOLDER', `no value for {${name}}`);
  });
}

export function renderMessage(templateId: string, locale: Locale, values: Record<string, string | number>): MessageTemplate {
  const template = CATALOGUE[templateId]?.[locale];
  if (!template) throw new BillingError('TEMPLATE_NOT_FOUND', `template ${templateId}/${locale} not found`);
  return { subject: renderText(template.subject, values), body: renderText(template.body, values) };
}
