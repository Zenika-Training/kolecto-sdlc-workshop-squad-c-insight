import { describe, expect, it } from 'vitest';
import { renderText } from '../../src/billing/templates/renderer.js';

describe('renderer', () => {
  it('fills placeholders', () => {
    expect(renderText('Invoice {n} is due', { n: 'F-1' })).toBe('Invoice F-1 is due');
  });
  it('refuses a missing value', () => {
    expect(() => renderText('Invoice {n}', {})).toThrow('no value for {n}');
  });
});
