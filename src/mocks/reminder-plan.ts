/**
 * Mock of squad B's `reminder-events` contract, **v0.1.0** (teams/squad-b-outreach/contracts/reminder-events.md),
 * written by facilitation before squad B existed. Code against it until squad B publishes v1, then align this mock
 * and your types with the published contract, field for field.
 */
export interface ReminderPlanV0 {
  invoiceId: string;
  send: boolean;
  sendAt?: string;
  template?: string;
  step?: 'friendly' | 'firm' | 'formal';
  feeMinor?: number;
}

/** A small pilot log: what squad B planned in November, in the v0 shape. */
export const pilotLog: ReminderPlanV0[] = [
  { invoiceId: 'inv_0002', send: true, sendAt: '2026-11-16T10:00:00+01:00', template: 'firm-fr', step: 'firm', feeMinor: 0 },
  { invoiceId: 'inv_0005', send: true, sendAt: '2026-11-16T10:00:00+01:00', template: 'formal-en', step: 'formal', feeMinor: 5890 },
  { invoiceId: 'inv_0012', send: true, sendAt: '2026-11-20T10:00:00+01:00', template: 'friendly-fr', step: 'friendly', feeMinor: 0 },
  { invoiceId: 'inv_0022', send: false },
];
