/** Who did what on which object, for finance audits. Ids only: no personal data (SEC-03). */
export interface AuditEntry {
  at: string;
  actor: string;
  action: 'invoice.sent' | 'payment.allocated' | 'export.generated' | 'dunning.exported' | 'reminder.scheduled';
  objectId: string;
  details?: Record<string, string | number>;
}

export class AuditLog {
  private readonly entries: AuditEntry[] = [];

  record(entry: AuditEntry): void {
    this.entries.push(entry);
  }

  byObject(objectId: string): AuditEntry[] {
    return this.entries.filter((e) => e.objectId === objectId);
  }

  all(): AuditEntry[] {
    return [...this.entries];
  }
}

/** One shared log per process, as in production. Tests create their own. */
export const auditLog = new AuditLog();
