// Lists the @deprecated symbols of the code (Core Billing included), and where the squad's code still uses them.
//   npm run deprecated
// The graph shows who depends on a symbol, not whether it is deprecated: check here before building on one (ORG-08).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { green, red } from './lib.mjs';

const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(join(dir, d.name)) : d.name.endsWith('.ts') ? [join(dir, d.name)] : []));
const all = files('src');

const deprecated = [];
for (const file of all) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/@deprecated\s*([\s\S]*?)\*\/\s*export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g)) {
    const line = text.slice(0, m.index).split('\n').length;
    deprecated.push({ name: m[2], where: `${file}:${line}`, why: m[1].replace(/\s*\*\s*/g, ' ').trim() });
  }
}

console.log(`@deprecated symbols (${deprecated.length}):\n`);
for (const d of deprecated) console.log(`  ${d.name.padEnd(14)} ${d.where}\n  ${''.padEnd(14)} ${d.why}\n`);

const ours = all.filter((f) => !f.startsWith(join('src', 'billing')));
const uses = ours.flatMap((f) => {
  const text = readFileSync(f, 'utf8');
  // Only imports from Core Billing count: a field that happens to share a name (daysLate in a contract) is not a use.
  const imported = [...text.matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"][^'"]*billing[^'"]*['"]/g)].flatMap((m) => m[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0]));
  return deprecated.filter((d) => imported.includes(d.name)).map((d) => `${f} imports ${d.name}`);
});
if (uses.length) { red('✗ The squad\'s code uses deprecated symbols:'); for (const u of uses) console.log(`  ${u}`); process.exit(1); }
green('✓ The squad\'s code uses none of them.');
