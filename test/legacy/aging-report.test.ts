import { describe, expect, it } from 'vitest';
import { bucketOf } from '../../src/billing/reporting/aging-report.js';

describe('aging-report', () => {
  it('buckets by days past due', () => {
    expect([0, 1, 30, 31, 61, 91].map(bucketOf)).toEqual(['not_due', '1-30', '1-30', '31-60', '61-90', '90+']);
  });
});
