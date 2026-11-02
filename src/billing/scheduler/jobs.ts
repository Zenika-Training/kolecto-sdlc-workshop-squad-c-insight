import { manualReminderCsv } from '../dunning-v0/manual-reminder-export.js';
import { receivablesExport } from '../exports/accounting-export.js';
import { InvoiceRepository } from '../ledger/invoice-repository.js';
import { PaymentRepository } from '../ledger/payment-repository.js';
import { agingReport } from '../reporting/aging-report.js';
import type { Day } from '../calendar/day-math.js';

/** Recurring jobs of Core Billing. The platform scheduler calls `run(id, day)`. */
export interface Job {
  id: string;
  /** cron expression, Paris time */
  schedule: string;
  run(day: Day): string;
}

export const JOBS: Job[] = [
  {
    id: 'dunning-v0-weekly',
    schedule: '0 7 * * MON',
    run: (day) => manualReminderCsv(day),
  },
  {
    id: 'receivables-monthly',
    schedule: '0 6 1 * *',
    run: (day) => receivablesExport(new InvoiceRepository().all(), new PaymentRepository().all(), day),
  },
  {
    id: 'aging-daily',
    schedule: '0 6 * * *',
    run: (day) => JSON.stringify(agingReport(new InvoiceRepository().all(), new PaymentRepository().all(), day)),
  },
];

export function runJob(id: string, day: Day): string {
  const job = JOBS.find((j) => j.id === id);
  if (!job) throw new Error(`unknown job ${id}`);
  return job.run(day);
}
