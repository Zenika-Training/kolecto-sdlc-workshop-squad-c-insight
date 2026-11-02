import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isEnabled, loadFlags } from '../../src/flags.js';

function file(content: string): string {
  const path = join(mkdtempSync(join(tmpdir(), 'flags-')), 'flags.json');
  writeFileSync(path, content);
  return path;
}

describe('flags', () => {
  it('reads flags.json', () => {
    expect(isEnabled(loadFlags(file('{"a": true, "b": false}')), 'a')).toBe(true);
  });
  it('treats an unknown flag as disabled', () => {
    expect(isEnabled(loadFlags(file('{}')), 'missing')).toBe(false);
  });
  it('refuses a non-boolean value', () => {
    expect(() => loadFlags(file('{"a": "on"}'))).toThrow(/true or false/);
  });
});
