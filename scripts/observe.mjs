// Reads health and metrics of the deployed service (G4: observable).
// Checks that the process answering is the one npm run deploy started from this folder.
import { existsSync, readFileSync } from 'node:fs';
import { PORT, green, red } from './lib.mjs';

const deployed = existsSync('.run/server.pid') ? Number(readFileSync('.run/server.pid', 'utf8')) : null;
let health, metrics;
try {
  health = await (await fetch(`http://localhost:${PORT}/health`)).json();
  metrics = await (await fetch(`http://localhost:${PORT}/metrics`)).json();
} catch {
  red(`✗ No service on port ${PORT}: run npm run deploy`);
  process.exit(1);
}
if (!deployed || health.pid !== deployed) {
  red(`✗ Port ${PORT} answers, but not with the service deployed from here (answering pid ${health.pid ?? '?'}, deployed pid ${deployed ?? 'none'}).\n  Stop the other process, then npm run deploy`);
  process.exit(1);
}
green(`✓ ${health.squad} answers on port ${PORT} (pid ${health.pid})`);
console.log('Flags    :', JSON.stringify(health.flags));
console.log('Started  :', metrics.startedAt);
console.log('Requests :', JSON.stringify(metrics.requests, null, 2));
