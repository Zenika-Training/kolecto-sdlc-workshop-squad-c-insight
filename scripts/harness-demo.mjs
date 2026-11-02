// Shows the "block" layer of the harness on its own: sends the guard hook the actions an agent might try,
// exactly as Claude Code does before each tool call, and prints what the hook answers.
//   npm run harness-demo
// Why a script: with CLAUDE.md in place, Claude refuses these actions itself before calling any tool,
// so the hook rarely gets the chance to speak in a live demo. This is what it says when it does.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FLAG, NEXUS, SQUAD, green, red } from './lib.mjs';

const project = resolve('.');
// Another squad of the programme, from the Nexus config (any squad but this one).
const config = resolve(NEXUS, 'tools/hackathon.config.json');
const squads = existsSync(config) ? Object.keys(JSON.parse(readFileSync(config, 'utf8')).squads) : ['squad-a-policy', 'squad-b-outreach'];
const other = squads.find((s) => s !== SQUAD);
const attempts = [
  ['Switch the feature flag on', 'Bash', { command: `npm run flag -- ${FLAG} on --reason "demo"` }],
  ['Edit a reference test', 'Edit', { file_path: resolve('test/reference/reference.test.ts'), old_string: 'x', new_string: 'y' }],
  ['"Improve" Core Billing', 'Edit', { file_path: resolve('src/billing/ledger/balance.ts'), old_string: 'x', new_string: 'y' }],
  ['Write in the other squad\'s Nexus folder', 'Write', { file_path: resolve(`../context-nexus/teams/${other}/contracts/x.md`), content: 'x' }],
  ['Run the unit tests (allowed)', 'Bash', { command: 'npm test' }],
  ['Read the flag script (allowed)', 'Bash', { command: 'grep -n reason scripts/flag.mjs' }],
];

console.log('The guard hook (.claude/hooks/guard.mjs), fed the tool calls an agent would make:\n');
for (const [label, tool, input] of attempts) {
  const r = spawnSync(process.execPath, ['.claude/hooks/guard.mjs'], {
    input: JSON.stringify({ tool_name: tool, tool_input: input, cwd: project }),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: project, HARNESS_DEMO: '1' },
  });
  if (r.status === 2) {
    red(`✗ ${label}: blocked`);
    console.log(`  ${r.stderr.trim()}\n`);
  } else { green(`✓ ${label}: let through`); console.log(); }
}
console.log('Exit code 2 = blocked, and the message goes back to the agent. Settings.json denies some of these too: belt and braces.');
