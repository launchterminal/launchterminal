import { describe, it, expect, beforeEach } from 'vitest';
import SentimentPlugin from '@/plugins/sentiment';
import pino from 'pino';

const logger = pino({ level: 'silent' });

describe('SentimentPlugin', () => {
  let plugin: SentimentPlugin;

  beforeEach(async () => {
    plugin = new SentimentPlugin();
    await plugin.onInit({
      config: {
        threshold: 0.3,
        languages: ['en'],
      },
      logger,
    });
  });

  it('should detect positive sentiment', async () => {
    const message = globalThis.testUtils.createMockMessage({
      content: 'This is great and amazing, love it!',
    });

    const result = await plugin.onMessage(message);
    const score = result.metadata.get('sentiment_score') as number;
    const label = result.metadata.get('sentiment_label') as string;

    expect(score).toBeGreaterThan(0);
    expect(label).toBe('positive');
  });

  it('should detect negative sentiment', async () => {
    const message = globalThis.testUtils.createMockMessage({
      content: 'This is terrible and awful, hate it!',
    });

    const result = await plugin.onMessage(message);
    const score = result.metadata.get('sentiment_score') as number;
    const label = result.metadata.get('sentiment_label') as string;

    expect(score).toBeLessThan(0);
    expect(label).toBe('negative');
  });

  it('should return neutral for mixed content', async () => {
    const message = globalThis.testUtils.createMockMessage({
      content: 'The weather is normal today',
    });

    const result = await plugin.onMessage(message);
    const label = result.metadata.get('sentiment_label') as string;

    expect(label).toBe('neutral');
  });

  it('should handle empty content', async () => {
    const message = globalThis.testUtils.createMockMessage({ content: '' });

    const result = await plugin.onMessage(message);
    const score = result.metadata.get('sentiment_score') as number;

    expect(score).toBe(0);
  });
});
