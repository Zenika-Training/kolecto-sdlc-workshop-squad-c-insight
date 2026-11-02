/** Small result type used by the exports, which must not stop on one bad line. */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T>(error: string): Result<T> => ({ ok: false, error });

export function partition<T>(results: Result<T>[]): { values: T[]; errors: string[] } {
  const values: T[] = [];
  const errors: string[] = [];
  for (const r of results) {
    if (r.ok) values.push(r.value);
    else errors.push(r.error);
  }
  return { values, errors };
}
