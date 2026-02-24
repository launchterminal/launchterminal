import type { Plugin, PluginContext, UnifiedMessage } from '@/core/types';
import type { Logger } from 'pino';
import { RateLimitError } from '@/utils/errors';

interface RateLimiterConfig {
  strategy: 'sliding-window' | 'fixed-window' | 'token-bucket';
  max_requests: number;
  window_ms: number;
  key_prefix: string;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

export default class RateLimiterPlugin implements Plugin {
  name = 'rate-limiter';
  version = '1.0.0';
  priority = 10; // Runs early in pipeline

  private config!: RateLimiterConfig;
  private logger!: Logger;
  private windows: Map<string, WindowEntry> = new Map();
  private cleanupInterval?: ReturnType<typeof setInterval>;

  async onInit(ctx: PluginContext): Promise<void> {
    this.config = ctx.config as unknown as RateLimiterConfig;
    this.logger = ctx.logger;

    // Periodic cleanup of expired windows
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.windows) {
        if (now > entry.resetAt) {
          this.windows.delete(key);
        }
      }
    }, this.config.window_ms);

    this.logger.info(
      { strategy: this.config.strategy, maxRequests: this.config.max_requests },
      'Rate limiter plugin initialized',
    );
  }

  async onMessage(message: UnifiedMessage): Promise<UnifiedMessage> {
    const key = `${this.config.key_prefix}${message.platform}:${message.userId}`;
    const now = Date.now();

    let entry = this.windows.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.config.window_ms };
      this.windows.set(key, entry);
    }

    entry.count++;

    if (entry.count > this.config.max_requests) {
      const retryAfter = entry.resetAt - now;
      this.logger.warn(
        { userId: message.userId, platform: message.platform, count: entry.count, retryAfterMs: retryAfter },
        'Rate limit exceeded',
      );

      message.blocked = true;
      message.blockReason = `Rate limit exceeded. Try again in ${Math.ceil(retryAfter / 1000)}s.`;
      message.metadata.set('rate_limited', true);
      message.metadata.set('retry_after_ms', retryAfter);

      return message;
    }

    message.metadata.set('rate_limit_remaining', this.config.max_requests - entry.count);
    return message;
  }

  async onDestroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.windows.clear();
    this.logger.info('Rate limiter plugin destroyed');
  }
}
