import { describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';

const on = { reminders_pilot_kpi: true };
const off = { reminders_pilot_kpi: false };
const kpi = (query: string) => ({ method: 'GET' as const, url: `/v1/pilot/kpi${query}` });

describe('starter squad-c-insight', () => {
  it('answers /health with the squad and its flags', async () => {
    const res = await buildApp({ flags: off }).inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok', squad: 'squad-c-insight', flags: off });
  });

  it('hides the route while the flag is off', async () => {
    const res = await buildApp({ flags: off }).inject(kpi('?from=2026-11-01&to=2026-11-30'));
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'PILOT_FEATURE_DISABLED' });
  });

  it('rejects a period that is missing or upside down', async () => {
    expect((await buildApp({ flags: on }).inject(kpi('?from=2026-11-01'))).statusCode).toBe(400);
    expect((await buildApp({ flags: on }).inject(kpi('?from=2026-11-30&to=2026-11-01'))).statusCode).toBe(400);
  });

  // Starter behaviour: replace this test once measurePilot is implemented.
  it('answers 501 while measurePilot is a stub', async () => {
    const res = await buildApp({ flags: on }).inject(kpi('?from=2026-11-01&to=2026-11-30'));
    expect(res.statusCode).toBe(501);
  });

  it('counts requests in /metrics', async () => {
    const app = buildApp({ flags: off });
    await app.inject({ method: 'GET', url: '/health' });
    const res = await app.inject({ method: 'GET', url: '/metrics' });
    expect(res.json().requests).toMatchObject({ '/health 200': 1 });
  });
});
