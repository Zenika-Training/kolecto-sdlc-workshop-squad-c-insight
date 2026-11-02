// Runs a Context Nexus tool from the starter, wherever the Nexus is cloned (NEXUS_DIR or ../context-nexus).
//   node scripts/nexus.mjs <tool> [args…]      e.g. node scripts/nexus.mjs publish -m "publish business intent"
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { NEXUS, requireNexus } from './lib.mjs';

const [tool, ...args] = process.argv.slice(2);
if (!tool) { console.log('Usage: node scripts/nexus.mjs <tool> [args…]'); process.exit(2); }
requireNexus();
const r = spawnSync(process.execPath, [resolve(NEXUS, 'tools', `${tool}.mjs`), ...args], { stdio: 'inherit', env: { ...process.env, NEXUS_DIR: NEXUS } });
process.exit(r.status ?? 1);
