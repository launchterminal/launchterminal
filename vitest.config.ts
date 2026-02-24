import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['tests/e2e/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/**/index.ts',
        'src/db/migrations/**',
        'src/db/seed.ts',
      ],
      thresholds: {
        branches: 85,
        functions: 90,
        lines: 95,
        statements: 95,
      },
    },
    setupFiles: ['tests/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/core': path.resolve(__dirname, 'src/core'),
      '@/adapters': path.resolve(__dirname, 'src/adapters'),
      '@/plugins': path.resolve(__dirname, 'src/plugins'),
      '@/transport': path.resolve(__dirname, 'src/transport'),
      '@/config': path.resolve(__dirname, 'src/config'),
      '@/db': path.resolve(__dirname, 'src/db'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
    },
  },
});
