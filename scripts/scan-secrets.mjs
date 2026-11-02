// Secrets and bank-data scan (SEC-01, SEC-02). Exit 1 on any finding.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'test', 'data', 'scripts'];
const PATTERNS = [
  ['Anthropic API key', /sk-ant-[A-Za-z0-9_-]{10,}/],
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['generic secret assignment', /\b(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{12,}['"]/i],
  ['IBAN', /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}\b/],
];
const SELF = 'scripts/scan-secrets.mjs';
const files = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? files(p) : [p]; }) : []);

const findings = [];
for (const file of ROOTS.flatMap(files).filter((f) => f !== SELF)) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const [label, re] of PATTERNS) if (re.test(line)) findings.push(`${file}:${i + 1}  ${label}`);
  });
}
if (findings.length) { console.log(`✗ ${findings.length} finding(s):\n  ${findings.join('\n  ')}`); process.exit(1); }
console.log('✓ No secret or bank data found (SEC-01, SEC-02).');
