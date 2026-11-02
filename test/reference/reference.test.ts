// Reference tests · READ-ONLY (ENG-04). Generated from the business's acceptance examples in the Context Nexus.
import { describe, expect, it } from 'vitest';
import { measurePilot, type MeasurePilotInput } from '../../src/domain/measure-pilot.js';
import { loadReferenceCases } from './load-cases.js';

const cases = loadReferenceCases();

describe(`reference cases ${cases.version} · measurePilot`, () => {
  for (const c of cases.measurePilot) {
    it(c.name, () => {
      expect(measurePilot(c.input as MeasurePilotInput)).toEqual(c.expected);
    });
  }
});
