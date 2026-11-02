import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

export const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
export const SQUAD = pkg.config.squad;
export const FLAG = pkg.config.flag;
export const PORT = Number(process.env.PORT ?? pkg.config.port);
/** The Context Nexus is cloned next to the starter (override with NEXUS_DIR). */
export const NEXUS = resolve(process.env.NEXUS_DIR ?? '../context-nexus');
export const TEAM = resolve(NEXUS, 'teams', SQUAD);

export const green = (t) => console.log(`\x1b[32m${t}\x1b[0m`);
export const red = (t) => console.log(`\x1b[31m${t}\x1b[0m`);

export function requireNexus() {
  if (!existsSync(resolve(NEXUS, 'tools/context-assemble.mjs'))) {
    red(`Context Nexus not found in ${NEXUS}. Clone it next to the starter, or set NEXUS_DIR.`);
    process.exit(2);
  }
}

export function gitUser() {
  try { return execFileSync('git', ['config', 'user.name'], { encoding: 'utf8' }).trim() || process.env.USER || 'unknown'; }
  catch { return process.env.USER ?? process.env.USERNAME ?? 'unknown'; }
}

/** ISO 8601 instant in Paris time with its offset (ORG-03), whatever the machine's time zone. */
export function nowIso(date = new Date()) {
  const o = {};
  for (const p of new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date)) o[p.type] = p.value;
  const wall = Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour, +o.minute, +o.second);
  const off = Math.round((wall - Math.floor(date.getTime() / 1000) * 1000) / 60000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${o.year}-${o.month}-${o.day}T${o.hour}:${o.minute}:${o.second}${off >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
}
