import Fastify, { type FastifyInstance } from 'fastify';
import { SQUAD } from './config.js';
import { loadFlags, type Flags } from './flags.js';
import { Metrics } from './metrics.js';
import { registerRoutes } from './routes.js';

export interface AppOptions {
  flags?: Flags;
  logger?: boolean;
}

export function buildApp(options: AppOptions = {}): FastifyInstance {
  const flags = options.flags ?? loadFlags();
  const metrics = new Metrics();
  // Never log request bodies or authorization headers (SEC-03): ids only.
  const app = Fastify({ logger: options.logger ? { redact: ['req.headers.authorization'] } : false });

  app.addHook('onResponse', async (request, reply) => {
    metrics.record(request.routeOptions.url ?? 'unknown', reply.statusCode);
  });
  // pid: deploy and observe check that the process answering is the one deployed from this folder.
  app.get('/health', async () => ({ status: 'ok', squad: SQUAD, pid: process.pid, flags }));
  app.get('/metrics', async () => metrics.snapshot());
  registerRoutes(app, flags);
  return app;
}
