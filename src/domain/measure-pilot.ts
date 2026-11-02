import { NotImplementedError } from './not-implemented.js';
import type { Invoice, Payment } from './types.js';
import type { ReminderPlanV0 } from '../mocks/reminder-plan.js';

export interface MeasurePilotInput {
  /** The plans published by squad B (reminder-events contract). Until B publishes v1, see src/mocks/. */
  plans: ReminderPlanV0[];
  invoices: Invoice[];
  payments: Payment[];
  /** The pilot period, `YYYY-MM-DD`, both days included (never the system clock: decision D-06). */
  from: string;
  to: string;
}

/** The pilot's figures. Their exact shape is yours to define in your spec and publish in your contract. */
export type PilotKpi = Record<string, unknown>;

/**
 * Squad C · Insight. Business rules RR-10 to RR-13; exact expected outputs in the reference cases.
 * Reuse Core Billing (src/billing/reporting/) where it already does the job: `npm run graph`, then `graphify query`.
 */
export function measurePilot(input: MeasurePilotInput): PilotKpi {
  void input;
  throw new NotImplementedError('measurePilot');
}
