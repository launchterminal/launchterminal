import type { Plugin, PluginContext, UnifiedMessage } from '@/core/types';
import type { Logger } from 'pino';

interface SentimentConfig {
  threshold: number;
  languages: string[];
}

// Simple rule-based sentiment analysis with keyword matching
const POSITIVE_WORDS = new Set(['good', 'great', 'love', 'amazing', 'awesome', 'thanks', 'thank', 'helpful', 'excellent', 'fantastic', 'wonderful', 'happy', 'nice']);
const NEGATIVE_WORDS = new Set(['bad', 'terrible', 'hate', 'awful', 'horrible', 'worst', 'angry', 'frustrated', 'annoying', 'useless', 'broken', 'stupid']);

export default class SentimentPlugin implements Plugin {
  name = 'sentiment';
  version = '1.2.0';
  priority = 30;

  private config!: SentimentConfig;
  private logger!: Logger;

  async onInit(ctx: PluginContext): Promise<void> {
    this.config = ctx.config as unknown as SentimentConfig;
    this.logger = ctx.logger;
    this.logger.info({ threshold: this.config.threshold }, 'Sentiment plugin initialized');
  }

  async onMessage(message: UnifiedMessage): Promise<UnifiedMessage> {
    const score = this.analyzeSentiment(message.content);
    message.metadata.set('sentiment_score', score);
    message.metadata.set('sentiment_label', this.getLabel(score));

    this.logger.debug({ score, label: this.getLabel(score) }, 'Sentiment analyzed');

    // Block highly negative messages if below threshold
    if (score < -this.config.threshold) {
      this.logger.warn({ score, userId: message.userId }, 'Negative sentiment detected');
    }

    return message;
  }

  private analyzeSentiment(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      if (POSITIVE_WORDS.has(word)) positiveCount++;
      if (NEGATIVE_WORDS.has(word)) negativeCount++;
    }

    const total = positiveCount + negativeCount;
    if (total === 0) return 0;

    return (positiveCount - negativeCount) / total;
  }

  private getLabel(score: number): string {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }

  async onDestroy(): Promise<void> {
    this.logger.info('Sentiment plugin destroyed');
  }
}
