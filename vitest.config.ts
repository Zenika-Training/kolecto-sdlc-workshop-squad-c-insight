import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // src/billing/ is Core Billing's existing code, with its own suite in test/legacy/: ENG-03 applies to the squad's code.
      exclude: ['src/index.ts', 'src/billing/**'],
      // ENG-03: line coverage ≥ 70 %
      thresholds: { lines: 70 },
    },
  },
});
