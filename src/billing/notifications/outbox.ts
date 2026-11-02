import type { Mailer, OutgoingEmail } from './mailer.js';

export interface OutboxEntry {
  email: OutgoingEmail;
  status: 'queued' | 'sent' | 'failed';
  attempts: number;
  messageId?: string;
}

/**
 * Queues e-mails and sends the ones whose `sendAt` is reached. The scheduler calls `flush(now)` every minute.
 * Never sends twice the same (to, template, invoice) on the same day (BILL-91).
 */
export class Outbox {
  private readonly entries: OutboxEntry[] = [];

  constructor(private readonly mailer: Mailer) {}

  enqueue(email: OutgoingEmail): boolean {
    const key = dedupKey(email);
    if (this.entries.some((e) => dedupKey(e.email) === key)) return false;
    this.entries.push({ email, status: 'queued', attempts: 0 });
    return true;
  }

  async flush(nowIso: string): Promise<number> {
    const now = Date.parse(nowIso);
    let sent = 0;
    for (const entry of this.entries) {
      if (entry.status !== 'queued' || Date.parse(entry.email.sendAt) > now) continue;
      entry.attempts += 1;
      try {
        entry.messageId = (await this.mailer.send(entry.email)).messageId;
        entry.status = 'sent';
        sent += 1;
      } catch {
        if (entry.attempts >= 3) entry.status = 'failed';
      }
    }
    return sent;
  }

  pending(): OutboxEntry[] {
    return this.entries.filter((e) => e.status === 'queued');
  }
}

const dedupKey = (e: OutgoingEmail) => `${e.to}|${e.template}|${e.tags.invoiceId ?? ''}|${e.sendAt.slice(0, 10)}`;
