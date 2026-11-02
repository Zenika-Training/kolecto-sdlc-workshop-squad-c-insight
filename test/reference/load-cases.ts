// Reference tests · owned by the programme, READ-ONLY for squads (ENG-04; the harness blocks edits here).
// Loads the business's acceptance examples from the Context Nexus, at their CURRENT version:
// when the business changes a rule, these tests change with it.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface ReferenceCase<I = unknown, O = unknown> {
  name: string;
  input: I;
  expected: O;
}

export interface ReferenceCases {
  version: string;
  decideReminder: ReferenceCase[];
  planReminder: ReferenceCase[];
  measurePilot: ReferenceCase[];
}

const NEXUS = resolve(process.env.NEXUS_DIR ?? '../context-nexus');
const FILE = resolve(NEXUS, 'programme/payment-reminders/contracts/reference-cases.md');

export function loadReferenceCases(): ReferenceCases {
  if (!existsSync(FILE)) throw new Error(`Reference cases not found in ${FILE}. Is the Context Nexus cloned next to the starter (or NEXUS_DIR set)?`);
  const text = readFileSync(FILE, 'utf8');
  const block = text.split('```json')[1]?.split('```')[0];
  if (!block) throw new Error(`No json block in ${FILE}`);
  return JSON.parse(block) as ReferenceCases;
}
