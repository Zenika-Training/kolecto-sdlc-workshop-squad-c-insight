import type { FastifyInstance } from 'fastify';
import { FLAG } from './config.js';
import { invoices, payments } from './data.js';
import { measurePilot } from './domain/measure-pilot.js';
import { NotImplementedError } from './domain/not-implemented.js';
import { sendError } from './errors.js';
import { isEnabled, type Flags } from './flags.js';
import { pilotLog } from './mocks/reminder-plan.js';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Squad C route, described by teams/squad-c-insight/contracts/pilot-kpi.md. */
export function registerRoutes(app: FastifyInstance, flags: Flags): void {
  app.get<{ Querystring: { from?: string; to?: string } }>('/v1/pilot/kpi', async (request, reply) => {
    if (!isEnabled(flags, FLAG)) return sendError(reply, 404, 'PILOT_FEATURE_DISABLED', `Feature disabled (flag ${FLAG})`);
    const { from, to } = request.query;
    if (!from || !to || !DAY.test(from) || !DAY.test(to) || from > to) return sendError(reply, 400, 'PILOT_INVALID_PERIOD', 'Query parameters from=YYYY-MM-DD and to=YYYY-MM-DD are required, from on or before to');
    try {
      // Until squad B deploys its service, the plans come from the v0 mock log.
      return measurePilot({ plans: pilotLog, invoices: invoices(), payments: payments(), from, to });
    } catch (error) {
      if (error instanceof NotImplementedError) return sendError(reply, 501, 'PILOT_NOT_IMPLEMENTED', error.message);
      throw error;
    }
  });
}
