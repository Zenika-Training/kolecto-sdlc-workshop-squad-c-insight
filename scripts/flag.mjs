// Switches a feature flag AND traces it in the squad's flag journal in the Context Nexus (ORG-02).
//   npm run flag -- <name> on|off --reason "why"
// Human only: Claude Code is denied this command by the harness (.claude/settings.json).
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { SQUAD, TEAM, requireNexus, gitUser, nowIso, green, red } from './lib.mjs';

const args = process.argv.slice(2);
const reasonIndex = args.indexOf('--reason');
const reason = reasonIndex >= 0 ? args[reasonIndex + 1] : undefined;
const [name, state] = args.filter((_, i) => i !== reasonIndex && i !== reasonIndex + 1);

if (!name || !['on', 'off'].includes(state) || !reason) {
  red('Usage: npm run flag -- <name> on|off --reason "why"');
  process.exit(2);
}
const flags = JSON.parse(readFileSync('flags.json', 'utf8'));
if (!(name in flags)) {
  red(`Unknown flag: ${name}. Flags declared in flags.json: ${Object.keys(flags).join(', ')}`);
  process.exit(2);
}
requireNexus();

const journal = resolve(TEAM, 'operations/flags-journal.md');
if (!existsSync(journal)) {
  mkdirSync(resolve(TEAM, 'operations'), { recursive: true });
  writeFileSync(journal, `# Flag journal · ${SQUAD}\n\n| at | flag | state | who | reason |\n|---|---|---|---|---|\n`);
}
appendFileSync(journal, `| ${nowIso()} | ${name} | ${state} | ${gitUser()} | ${reason.replaceAll('|', '/')} |\n`);
flags[name] = state === 'on';
writeFileSync('flags.json', JSON.stringify(flags, null, 2) + '\n');

green(`Flag ${name} → ${state}, traced in ${journal}`);
console.log('Next: publish the journal (/publish or npm run publish -- -m "flag …"), then redeploy (npm run deploy).');
