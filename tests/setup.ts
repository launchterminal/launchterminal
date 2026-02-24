import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables for tests
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.OPENCLAW_API_KEY = 'sk-test-xxxxxxxxxxxxxxxxxxxx';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/launchterminal_test';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-ok!';
  process.env.LOG_LEVEL = 'silent';
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Global test utilities
declare global {
  // eslint-disable-next-line no-var
  var testUtils: {
    createMockMessage: (overrides?: Partial<import('../src/core/types').UnifiedMessage>) => import('../src/core/types').UnifiedMessage;
  };
}

globalThis.testUtils = {
  createMockMessage: (overrides = {}) => ({
    id: 'test-msg-001',
    platform: 'web' as const,
    channelId: 'test-channel',
    userId: 'test-user',
    username: 'testuser',
    content: 'Hello, bot!',
    timestamp: new Date('2026-01-01T00:00:00Z'),
    metadata: new Map(),
    ...overrides,
  }),
};
