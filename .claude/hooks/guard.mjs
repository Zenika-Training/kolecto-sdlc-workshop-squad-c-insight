#!/usr/bin/env node
// Harness guardrails (Claude Code PreToolUse hook): the "block" layer of say / forbid / block / prove.
// What a prompt cannot guarantee, the hook enforces:
//   1. the agent never switches a feature flag (release ≠ activation, ORG-02);
//   2. in the Context Nexus, the agent writes only in teams/<its-squad>/ (ORG-07);
//   3. .context/brief.md is generated: never edited by hand;
//   4. test/reference/ belongs to the programme: never edited (ENG-04);
//   5. src/billing/ is existing Core Billing code owned by another team: reused, never edited (ORG-08).
// Exit code 2 = the action is blocked and stderr is shown to the agent.
// Any internal error lets the action through: a guardrail must never block work by accident.

import { readFileSync, existsSync, realpathSync, appendFileSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname, basename, sep } from 'node:path';

function safe(fn, fallback) { try { return fn(); } catch { return fallback; } }

const input = safe(() => JSON.parse(readFileSync(0, 'utf8')), {});
const project = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const tool = input.tool_name || '';
const ti = input.tool_input || {};

const squad = safe(() => readFileSync(join(project, '.hackathon', 'squad'), 'utf8').trim(), null)
  || (basename(project).startsWith('starter-') ? basename(project).replace(/^starter-/, '') : null);
const projectReal = safe(() => realpathSync(project), project);

function nexusDirs() {
  return [process.env.NEXUS_DIR, join(project, '..', 'context-nexus'), join(project, 'context-nexus')]
    .filter(d => d && existsSync(join(d, 'teams')))
    .map(d => safe(() => realpathSync(d), resolve(d)));
}

function realPathOf(p) {
  const abs = resolve(project, p);
  // The file may not exist yet: resolve the closest existing folder.
  let dir = abs; const tail = [];
  while (!existsSync(dir) && dirname(dir) !== dir) { tail.unshift(basename(dir)); dir = dirname(dir); }
  return join(safe(() => realpathSync(dir), dir), ...tail);
}

function block(rule, message) {
  if (!process.env.HARNESS_DEMO) safe(() => {
    mkdirSync(join(project, '.hackathon'), { recursive: true });
    appendFileSync(join(project, '.hackathon', 'guard.log'), JSON.stringify({ at: new Date().toISOString(), rule, tool }) + '\n');
  });
  process.stderr.write(`[harness · blocked: ${rule}] ${message}\n`);
  process.exit(2);
}

// Write targets of a Bash command: redirections (> >>), tee, cp/mv/install/ln (last argument),
// rm/touch/mkdir/truncate (all arguments), sed -i / perl -i. Deliberately simple: it catches an agent's usual
// writes, not an obscure script. When in doubt it lets the command through.
function splitShell(str) {
  const out = []; let cur = ''; let q = null;
  for (const ch of str) {
    if (q) { if (ch === q) q = null; else cur += ch; }
    else if (ch === '"' || ch === "'") q = ch;
    else if (/\s/.test(ch)) { if (cur) out.push(cur); cur = ''; }
    else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}
function bashWriteTargets(command) {
  const targets = [];
  for (const seg of command.split(/\n|&&|\|\||;|\|/)) {
    const t = splitShell(seg.trim());
    if (!t.length) continue;
    for (let i = 0; i < t.length; i++) {
      const m = t[i].match(/^(?:\d|&)?>>?(.*)$/);
      if (m) { const dest = m[1] || t[i + 1]; if (dest && !dest.startsWith('&') && dest !== '/dev/null') targets.push(dest); }
    }
    const words = t.filter(x => !/^(?:\d|&)?>>?/.test(x));
    let i = 0; while (i < words.length && (words[i] === 'sudo' || /^\w+=/.test(words[i]))) i++;
    const verb = words[i]; const args = words.slice(i + 1).filter(a => !a.startsWith('-'));
    if (verb === 'tee') targets.push(...args);
    else if (['cp', 'mv', 'install', 'ln'].includes(verb) && args.length >= 2) targets.push(args[args.length - 1]);
    else if (['rm', 'rmdir', 'touch', 'mkdir', 'truncate'].includes(verb)) targets.push(...args);
    else if (['sed', 'perl'].includes(verb) && words.some(a => /^-\w*i/.test(a))) targets.push(...args.slice(1));
  }
  return targets;
}

// Runs the flag switch: npm run flag, or the script executed (node scripts/flag.mjs, ./scripts/flag.mjs).
// Reading it (cat, grep, sed -n…) is fine: only the command's verb counts, not a path in its arguments.
function runsFlagScript(command) {
  if (/\bnpm\b(?:\s+-\S+)*\s+(?:run|run-script)\s+(?:--\s+)?flag(?:\s|$)/.test(command)) return true;
  for (const seg of command.split(/\n|&&|\|\||;|\|/)) {
    const words = splitShell(seg.trim());
    let i = 0; while (i < words.length && (['sudo', 'env', 'exec'].includes(words[i]) || /^\w+=/.test(words[i]))) i++;
    const verb = words[i] || '';
    const script = verb === 'node' || verb === 'bun' || verb === 'deno' ? words.slice(i + 1).find(w => !w.startsWith('-')) || '' : verb;
    if (/(^|\/)scripts\/flag\.mjs$/.test(script)) return true;
  }
  return false;
}

function checkWriteTarget(file, via) {
  const real = realPathOf(file.replace(/^~(?=\/|$)/, process.env.HOME || '~'));
  for (const nx of nexusDirs()) {
    if (real === nx || real.startsWith(nx + sep)) {
      const allowed = squad ? join(nx, 'teams', squad) + sep : null;
      if (!allowed || !(real + sep).startsWith(allowed)) {
        block('nexus-write', `The Context Nexus is shared: this squad writes only in teams/${squad || '<your-squad>'}/ (ORG-07)${via ? `; ${via} touches ${file}` : ''}. ` +
          'If the other squad\'s contract looks wrong, tell the humans: they go and talk to that squad.');
      }
    }
  }
  if (real === join(projectReal, '.context', 'brief.md')) {
    block('brief', 'This file is generated by the Context Assembler: do not edit it. Run npm run context to regenerate it from the Nexus.');
  }
  if ((real + sep).startsWith(join(projectReal, 'test', 'reference') + sep)) {
    block('reference-tests', 'test/reference/ holds the programme\'s reference tests (ENG-04): they are read-only. Make the code pass them; if a case looks wrong, tell the humans so they raise it with the Head of Receivables.');
  }
  if ((real + sep).startsWith(join(projectReal, 'src', 'billing') + sep)) {
    block('core-billing', 'src/billing/ is Core Billing\'s code, in production for every customer (ORG-08): reuse it, do not modify it. ' +
      'Import what you need from it in src/domain/. To see who depends on a symbol, run graphify affected "<symbol>". ' +
      'If it really needs a change, tell the humans: they open a change request with Core Billing.');
  }
}

if (tool === 'Bash' && typeof ti.command === 'string') {
  const cmd = ti.command;
  // 1. Flag switch (also denied in settings.json: belt and braces)
  if (runsFlagScript(cmd)) {
    block('flag', 'Switching a feature flag is a human decision (ORG-02: release ≠ activation). ' +
      'Tell the squad that their Decision Guarantor runs it in a terminal: npm run flag -- <name> on --reason "…". ' +
      'The journal line (who, when, why) is what gate G4 checks.');
  }
  // 2. Writes through a shell command
  for (const target of bashWriteTargets(cmd)) checkWriteTarget(target, 'the command');
  // 3. git add in the Nexus outside the squad folder
  const m = cmd.match(/git\s+-C\s+\S*context-nexus\S*\s+add\s+(.+?)(?:&&|;|\|\||$)/);
  if (m && squad) {
    const target = m[1].trim().replace(/^["']|["']$/g, '');
    if (!target.startsWith(`teams/${squad}`)) block('nexus-add', `Publishing is limited to teams/${squad}/ (ORG-07). Use npm run publish.`);
  }
}

if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
  const file = ti.file_path || ti.notebook_path;
  if (file) {
    checkWriteTarget(file);
    if (basename(realPathOf(file)) === 'flags.json') {
      const newText = [ti.new_string, ti.content, ...(Array.isArray(ti.edits) ? ti.edits.map(e => e.new_string) : [])].filter(Boolean).join('\n');
      if (/\btrue\b/.test(newText)) {
        block('flags-json', 'Switching a flag on by editing flags.json bypasses the flag journal. Human only, via npm run flag -- <name> on --reason "…" (ORG-02).');
      }
    }
  }
}
process.exit(0);
