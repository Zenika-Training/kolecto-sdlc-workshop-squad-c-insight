import { readFileSync } from 'node:fs';

/** Feature flags (flags.json). Every switch goes through `npm run flag`, which traces it in the Context Nexus. */
export type Flags = Record<string, boolean>;

export function loadFlags(path = 'flags.json'): Flags {
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (typeof raw !== 'object' || raw === null) throw new Error(`${path}: an object is expected`);
  for (const [name, value] of Object.entries(raw)) {
    if (typeof value !== 'boolean') throw new Error(`${path}: flag ${name} must be true or false`);
  }
  return raw as Flags;
}

export function isEnabled(flags: Flags, name: string): boolean {
  return flags[name] === true;
}
