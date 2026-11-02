// Gate-check: what can be verified without human judgement, before the gate keeper decides.
//   npm run gate -- G1   (G1 to G4)
// A ✗ names the missing criterion and how to fix it. Then ask the gate keeper for the gate.
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { NEXUS, PORT, SQUAD, FLAG, TEAM, requireNexus, green, red } from './lib.mjs';

const gate = (process.argv[2] ?? '').toUpperCase();
if (!/^G[1-4]$/.test(gate)) {
  red('Usage: npm run gate -- G1   (G1 to G4)');
  process.exit(2);
}
requireNexus();

const results = [];
const check = (id, label, ok, hint = '') => results.push({ id, label, ok: Boolean(ok), hint });

function frontmatter(path) {
  const m = readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  return Object.fromEntries(m[1].split('\n').map((l) => l.match(/^([\w-]+):\s*(.*?)\s*(#.*)?$/)).filter(Boolean).map((x) => [x[1], x[2]]));
}
const filled = (v) => v && v !== 'null' && !v.startsWith('<');
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const run = (cmd) => { try { execSync(cmd, { stdio: 'pipe' }); return true; } catch { return false; } };
// Pulls first, so the check sees what the other squad and the business published. On failure, the hint names the stale pins.
let staleHint = '';
const contextOk = () => {
  try { execSync(`node "${resolve(NEXUS, 'tools/context-assemble.mjs')}" --nexus "${NEXUS}" --squad ${SQUAD} --pull --check`, { stdio: 'pipe' }); return true; }
  catch (e) {
    // Name the squad's file that holds each stale pin: it may be the business intent, not the spec.
    const hints = []; let holder = '';
    for (const line of String(e.stdout ?? '').split('\n')) {
      const h = line.match(/^✗ (\S+) \(v[^,]+, (\w+)\)/);
      if (h) { holder = h[1].split('/').pop(); if (h[2] === 'stale') hints.push(`${holder} is stale`); continue; }
      const m = line.match(/^\s+(BREAKING|UPDATE|TARGET_STALE|MISSING)\s+(\S+)\s+pinned (\S+) → current (\S+)/);
      if (m) hints.push(`${holder ? `in ${holder}, ` : ''}${m[2].split('/').pop()} ${m[3]} → ${m[4]}`);
    }
    staleHint = [...new Set(hints)].join('; ');
    return false;
  }
};
// Published = committed in the Nexus and pushed: a file only in this Codespace is invisible to the other squad and the keeper.
const nexusGit = (args) => { try { return execFileSync('git', ['-C', NEXUS, ...args], { encoding: 'utf8', stdio: 'pipe' }); } catch { return null; } };
const published = (p) => {
  if (!existsSync(p)) return false;
  const rel = relative(NEXUS, p);
  if (nexusGit(['ls-files', '--error-unmatch', '--', rel]) === null || nexusGit(['status', '--porcelain', '--', rel])?.trim()) return false;
  return !nexusGit(['rev-parse', '@{u}']) || !nexusGit(['log', '--oneline', '@{u}..HEAD', '--', rel])?.trim();
};
const notPublished = (p) => (existsSync(p) ? 'written but not published yet: /publish (or npm run publish -- -m "…")' : '');
const mdFiles = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => resolve(dir, f)) : []);
const section = (body, h) => (body.split(h)[1] ?? '').split(/\n## /)[0].split('\n').slice(1).join('\n').trim();
const TAG = /\[(Nexus|Head of Receivables|Squad decision|To confirm)/i;

if (gate === 'G1') {
  const p = resolve(TEAM, 'intent/business-intent.md');
  const fm = existsSync(p) ? frontmatter(p) : {};
  const body = read(p);
  const sections = ['## 1.', '## 2.', '## 3.', '## 4.', '## 5.'].map((h) => section(body, h));
  const ok = sections.map((s) => s.length > 0 && !s.startsWith('<'));
  check('G1-1', 'Business Intent Spec published', published(p), notPublished(p) || `copy templates/business-intent.md to teams/${SQUAD}/intent/business-intent.md`);
  const placeholders = Object.entries(fm).filter(([, v]) => /<[^>]*>/.test(v)).map(([k]) => k);
  check('G1-2', 'status active, owner named, last-validated set, no template placeholder left', fm.status === 'active' && filled(fm.owner) && filled(fm['last-validated']) && placeholders.length === 0,
    placeholders.length ? `replace the <…> placeholder in: ${placeholders.join(', ')}` : 'a human reviews it, then sets status: active and their name as owner');
  check('G1-3', '5 sections filled', ok.every(Boolean), `empty: ${ok.map((v, i) => (v ? '' : i + 1)).filter(Boolean).join(', ')}`);
  check('G1-4', 'success criterion has a number (section 3)', ok[2] && /\d/.test(sections[2]), 'metric + threshold + horizon');
  check('G1-5', 'every section carries a source tag', ok.every(Boolean) && sections.every((s) => TAG.test(s)), '[Nexus: …], [Head of Receivables, …], [Squad decision], [To confirm: …]');
}

if (gate === 'G2') {
  const specs = mdFiles(resolve(TEAM, 'intent/specs'));
  const spec = specs.map((p) => [p, frontmatter(p), read(p)]).find(([, f]) => f.status === 'active') ?? specs.map((p) => [p, frontmatter(p), read(p)])[0];
  const unpublished = specs.filter((p) => !published(p));
  check('G2-1', 'spec published in intent/specs/', specs.length > 0 && unpublished.length === 0, unpublished.length ? `${unpublished.map((p) => p.split('/').pop()).join(', ')}: ${notPublished(unpublished[0])}` : 'templates/spec-frontmatter.md, or ask /publish');
  check('G2-2', 'spec active with an owner', spec && spec[1].status === 'active' && filled(spec[1].owner));
  const acs = spec ? [...new Set(spec[2].match(/\bAC-\d+\b/g) ?? [])] : [];
  const gwt = spec ? (spec[2].match(/\*\*Given\*\*|\bGiven\b/g) ?? []).length : 0;
  check('G2-3', '≥ 3 acceptance criteria with ids (AC-n), written Given/When/Then', acs.length >= 3 && gwt >= 3, `found ${acs.length} AC id(s), ${gwt} Given`);
  const contracts = mdFiles(resolve(TEAM, 'contracts')).map((p) => [p, frontmatter(p)]);
  const v0 = contracts.filter(([, f]) => Number((f.version ?? '0').split('.')[0]) < 1 || f.status !== 'active').map(([p]) => p.split('/').pop());
  const unpubContracts = contracts.filter(([p]) => !published(p)).map(([p]) => p.split('/').pop());
  check('G2-4', 'contract published in v1 (≥ 1.0.0), active', contracts.length > 0 && v0.length === 0 && unpubContracts.length === 0,
    v0.length ? `not yet 1.0.0 and active: ${v0.join(', ')}` : `${unpubContracts.join(', ')}: written but not published yet: /publish`);
  check('G2-5', 'pins up to date, nothing stale (context check)', contextOk(), `${staleHint ? `re-pin: ${staleHint}. ` : ''}npm run context shows the details`);
}

if (gate === 'G3') {
  check('G3-1', 'lint (ENG-01)', run('npm run lint'));
  check('G3-2', 'typecheck (ENG-01)', run('npm run typecheck'));
  check('G3-3', 'reference tests pass (ENG-04)', run('npm run test:reference'), 'npm run test:reference shows which case fails');
  check('G3-4', 'all tests and coverage ≥ 70 % (ENG-03)', run('npm run test:coverage'));
  const spec = mdFiles(resolve(TEAM, 'intent/specs')).map(read).join('\n');
  const acs = [...new Set(spec.match(/\bAC-\d+\b/g) ?? [])];
  const tests = (function all(dir) { return existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? all(resolve(dir, d.name)) : [read(resolve(dir, d.name))]) : []; })(resolve('test/unit')).join('\n');
  const untested = acs.filter((ac) => !new RegExp(`\\b${ac}\\b`).test(tests));
  check('G3-5', 'every acceptance criterion has a test named after it (ENG-02)', acs.length > 0 && untested.length === 0, untested.length ? `no test for ${untested.join(', ')}` : 'no AC-n id in the published spec');
  check('G3-6', 'no secret or bank data (SEC-01, SEC-02)', run('npm run scan'));
  check('G3-7', 'spec up to date, nothing stale (context check)', contextOk(), `${staleHint ? `re-pin: ${staleHint}. ` : ''}npm run context shows the details`);
}

if (gate === 'G4') {
  const flags = JSON.parse(readFileSync('flags.json', 'utf8'));
  const journal = read(resolve(TEAM, 'operations/flags-journal.md'));
  check('G4-1', `feature flag ${FLAG} switched on by a human`, flags[FLAG] === true && new RegExp(`\\| ${FLAG} \\| on \\|`).test(journal), `npm run flag -- ${FLAG} on --reason "…" (in a terminal: Claude is not allowed to)`);
  const untraced = Object.entries(flags).filter(([n, on]) => on && !new RegExp(`\\| ${n} \\| on \\|`).test(journal)).map(([n]) => n);
  check('G4-2', 'every flag that is on is traced in the journal (ORG-02)', untraced.length === 0, `untraced: ${untraced.join(', ')}`);
  const runbook = read(resolve(TEAM, 'operations/runbook.md'));
  const runbookPath = resolve(TEAM, 'operations/runbook.md');
  check('G4-3', 'runbook published with an owner and a rollback (ENG-06)', published(runbookPath) && /owner/i.test(runbook) && /rollback/i.test(runbook) && !/<first\.last|\*\*(?:Owner|Rollback):\*\*\s*</.test(runbook), notPublished(runbookPath) || `templates/runbook.md → teams/${SQUAD}/operations/runbook.md`);
  check('G4-4', `service deployed and observable (port ${PORT})`, run('node scripts/observe.mjs'), 'npm run deploy, then npm run observe says what answers on the port');
  check('G4-5', 'journal and runbook published to the Nexus', !nexusGit(['status', '--porcelain', '--', `teams/${SQUAD}/operations`])?.trim() && (!nexusGit(['rev-parse', '@{u}']) || !nexusGit(['log', '--oneline', '@{u}..HEAD', '--', `teams/${SQUAD}/operations`])?.trim()), '/publish');
  check('G4-6', 'nothing stale, every pin current (context check)', contextOk(), `${staleHint ? `re-pin: ${staleHint}. ` : ''}npm run context shows the details`);
}

console.log(`\nGate-check ${gate} · ${SQUAD}\n`);
for (const r of results) (r.ok ? green : red)(`${r.ok ? '✓' : '✗'} ${r.id}  ${r.label}${!r.ok && r.hint ? `  → ${r.hint}` : ''}`);
const ko = results.filter((r) => !r.ok).length;
console.log(ko ? `\n${ko} criterion(s) to fix before asking the gate keeper.` : '\nReady: ask the gate keeper.');
process.exit(ko ? 1 : 0);
