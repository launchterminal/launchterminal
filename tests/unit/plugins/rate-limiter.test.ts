import { describe, it, expect, beforeEach } from 'vitest';
import RateLimiterPlugin from '@/plugins/rate-limiter';
import pino from 'pino';

const logger = pino({ level: 'silent' });

describe('RateLimiterPlugin', () => {
  let plugin: RateLimiterPlugin;

  beforeEach(async () => {
    plugin = new RateLimiterPlugin();
    await plugin.onInit({
      config: {
        strategy: 'sliding-window',
        max_requests: 3,
        window_ms: 60000,
        key_prefix: 'test:',
      },
      logger,
    });
  });

  it('should allow messages within rate limit', async () => {
    const message = globalThis.testUtils.createMockMessage();
    const result = await plugin.onMessage(message);

    expect(result.blocked).toBeUndefined();
    expect(result.metadata.get('rate_limit_remaining')).toBe(2);
  });

  it('should block messages exceeding rate limit', async () => {
    const message = globalThis.testUtils.createMockMessage();

    // Exhaust rate limit
    await plugin.onMessage({ ...message, metadata: new Map() });
    await plugin.onMessage({ ...message, metadata: new Map() });
    await plugin.onMessage({ ...message, metadata: new Map() });

    // 4th request should be blocked
    const result = await plugin.onMessage({ ...message, metadata: new Map() });

    expect(result.blocked).toBe(true);
    expect(result.blockReason).toContain('Rate limit exceeded');
    expect(result.metadata.get('rate_limited')).toBe(true);
  });

  it('should track rate limits per user', async () => {
    const user1 = globalThis.testUtils.createMockMessage({ userId: 'user-1' });
    const user2 = globalThis.testUtils.createMockMessage({ userId: 'user-2' });

    // Exhaust user-1's limit
    await plugin.onMessage({ ...user1, metadata: new Map() });
    await plugin.onMessage({ ...user1, metadata: new Map() });
    await plugin.onMessage({ ...user1, metadata: new Map() });

    // user-2 should still be allowed
    const result = await plugin.onMessage({ ...user2, metadata: new Map() });
    expect(result.blocked).toBeUndefined();
  });

  it('should clean up on destroy', async () => {
    await plugin.onDestroy();
    // No error means success
  });
});
