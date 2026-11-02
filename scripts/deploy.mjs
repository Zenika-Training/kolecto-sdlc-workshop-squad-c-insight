// Local deploy: build, stop the previous instance, start in the background, health probe.
// The probe checks that the process answering is the one just started: another server on the port does not count.
import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { PORT, SQUAD, green, red, nowIso } from './lib.mjs';

mkdirSync('.run', { recursive: true });
execSync('npm run build', { stdio: 'inherit' });

if (existsSync('.run/server.pid')) {
  const previous = Number(readFileSync('.run/server.pid', 'utf8'));
  try { process.kill(previous); console.log(`Previous instance stopped (pid ${previous})`); } catch { /* already stopped */ }
  await new Promise((r) => setTimeout(r, 300));
}
const log = openSync('.run/server.log', 'a');
const child = spawn(process.execPath, ['dist/index.js'], { detached: true, stdio: ['ignore', log, log], env: { ...process.env, PORT: String(PORT) } });
let exited = null;
child.on('exit', (code) => { exited = code; });
child.unref();
writeFileSync('.run/server.pid', String(child.pid));

const health = async () => { try { const res = await fetch(`http://localhost:${PORT}/health`); return res.ok ? await res.json() : null; } catch { return null; } };
for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 250));
  if (exited !== null) break;
  const h = await health();
  if (h && h.pid === child.pid) {
    writeFileSync('.run/deploy.json', JSON.stringify({ deployedAt: nowIso(), squad: SQUAD, port: PORT, pid: child.pid, flags: h.flags }, null, 2));
    green(`Deployed: http://localhost:${PORT} (pid ${child.pid}, flags: ${JSON.stringify(h.flags)})`);
    process.exit(0);
  }
}
const other = await health();
if (other) red(`✗ Not deployed: port ${PORT} is already used by another process (${other.squad ?? 'unknown'}, pid ${other.pid ?? '?'}).\n  Stop it (kill ${other.pid ?? '<pid>'}, or close the terminal that runs it), then npm run deploy again.`);
else red(`✗ Not deployed: the service ${exited !== null ? `stopped at start (exit ${exited})` : 'does not answer on /health'}. See .run/server.log`);
process.exit(1);
