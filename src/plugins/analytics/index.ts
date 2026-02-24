import type { Plugin, PluginContext, UnifiedMessage, BotResponse } from '@/core/types';
import type { Logger } from 'pino';

interface AnalyticsConfig {
  provider: 'posthog' | 'mixpanel' | 'custom';
  flush_interval_ms: number;
  batch_size: number;
}

interface AnalyticsEvent {
  event: string;
  userId: string;
  properties: Record<string, unknown>;
  timestamp: Date;
}

export default class AnalyticsPlugin implements Plugin {
  name = 'analytics';
  version = '1.1.0';
  priority = 90; // Runs late in pipeline

  private config!: AnalyticsConfig;
  private logger!: Logger;
  private buffer: AnalyticsEvent[] = [];
  private flushInterval?: ReturnType<typeof setInterval>;

  async onInit(ctx: PluginContext): Promise<void> {
    this.config = ctx.config as unknown as AnalyticsConfig;
    this.logger = ctx.logger;

    this.flushInterval = setInterval(() => {
      void this.flush();
    }, this.config.flush_interval_ms ?? 10000);

    this.logger.info({ provider: this.config.provider }, 'Analytics plugin initialized');
  }

  async onMessage(message: UnifiedMessage): Promise<UnifiedMessage> {
    this.track({
      event: 'message_received',
      userId: message.userId,
      properties: {
        platform: message.platform,
        channelId: message.channelId,
        contentLength: message.content.length,
        sentiment: message.metadata.get('sentiment_label'),
      },
      timestamp: new Date(),
    });

    return message;
  }

  async onResponse(response: BotResponse): Promise<BotResponse> {
    this.track({
      event: 'response_sent',
      userId: 'system',
      properties: {
        requestId: response.requestId,
        contentLength: response.content.length,
        blocked: response.blocked,
      },
      timestamp: new Date(),
    });

    return response;
  }

  private track(event: AnalyticsEvent): void {
    this.buffer.push(event);

    if (this.buffer.length >= this.config.batch_size) {
      void this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, this.config.batch_size);
    this.logger.debug({ count: batch.length }, 'Flushing analytics events');

    try {
      // In production, this would POST to the analytics provider's API
      // PostHog: POST https://app.posthog.com/batch/
      // Mixpanel: POST https://api.mixpanel.com/track
      this.logger.debug({ provider: this.config.provider, events: batch.length }, 'Analytics batch sent');
    } catch (error) {
      this.logger.error({ error }, 'Failed to flush analytics events');
      // Re-queue failed events
      this.buffer.unshift(...batch);
    }
  }

  async onDestroy(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
    this.logger.info('Analytics plugin destroyed');
  }
}
