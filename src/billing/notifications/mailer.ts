/** An e-mail ready to be sent. `sendAt` is ISO 8601 with offset. */
export interface OutgoingEmail {
  to: string;
  subject: string;
  body: string;
  sendAt: string;
  /** Stable id of the template, for support and analytics. */
  template: string;
  tags: Record<string, string>;
}

/** Sending goes through the e-mail provider in production. Nothing here talks to the network. */
export interface Mailer {
  send(email: OutgoingEmail): Promise<{ messageId: string }>;
}

/** Keeps e-mails in memory: used by tests and by the pilot, which never sends for real. */
export class MemoryMailer implements Mailer {
  readonly sent: OutgoingEmail[] = [];

  async send(email: OutgoingEmail): Promise<{ messageId: string }> {
    this.sent.push(email);
    return { messageId: `mem-${this.sent.length}` };
  }
}
