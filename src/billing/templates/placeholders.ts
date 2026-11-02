/** `{name}` placeholders, as written by the finance team in the template catalogue. */
const PLACEHOLDER = /\{(\w+)\}/g;

export function placeholdersOf(template: string): string[] {
  return [...template.matchAll(PLACEHOLDER)].map((m) => m[1] ?? '');
}

export function fill(template: string, values: Record<string, string | number>, onMissing: (name: string) => string): string {
  return template.replace(PLACEHOLDER, (_, name: string) => (name in values ? String(values[name]) : onMissing(name)));
}
