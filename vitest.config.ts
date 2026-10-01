import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Kept separate from vite.config.ts so tests don't run the design-token/SEO build plugins.
export default defineConfig({
  plugins: [react()],
  define: { __SITE_URL__: JSON.stringify('https://flowboard.test') },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
    // Dummy values override .env.local so tests can never pick up real credentials.
    env: {
      VITE_SUPABASE_URL: 'http://supabase.test',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'test-key',
    },
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/**/*.d.ts'],
      reporter: ['text-summary', 'lcov'],
      // Gate sits just under the baseline (74/77/61/76) so CI fails on regressions; raise as coverage grows.
      thresholds: { statements: 70, branches: 72, functions: 57, lines: 72 },
    },
  },
});
