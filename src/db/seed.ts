import { config } from 'dotenv';
config();

import { connectDatabase } from './connection';
import { conversations, messages, plugins } from './models/schema';
import { createLogger } from '@/observability/logger';

const logger = createLogger('seed');

async function seed(): Promise<void> {
  logger.info('Starting database seed');

  const db = await connectDatabase({
    url: process.env.DATABASE_URL!,
    pool: { min: 1, max: 5, idle_timeout_ms: 5000 },
    ssl: false,
  });

  // Seed default plugins
  await db.insert(plugins).values([
    { name: 'sentiment', version: '1.2.0', enabled: true, config: { threshold: 0.3 } },
    { name: 'rate-limiter', version: '1.0.0', enabled: true, config: { max_requests: 60 } },
    { name: 'analytics', version: '1.1.0', enabled: true, config: { provider: 'posthog' } },
    { name: 'i18n', version: '0.9.0', enabled: false, config: { default_locale: 'en' } },
    { name: 'memory', version: '1.0.0', enabled: true, config: { ttl_seconds: 3600 } },
  ]).onConflictDoNothing();

  // Seed sample conversation
  const [conv] = await db.insert(conversations).values({
    userId: 'seed-user-001',
    platform: 'web',
    channelId: 'seed-channel-001',
    messageCount: 2,
  }).returning();

  if (conv) {
    await db.insert(messages).values([
      {
        conversationId: conv.id,
        role: 'user',
        content: 'Hello! What can you do?',
        platform: 'web',
        userId: 'seed-user-001',
        tokenCount: 8,
      },
      {
        conversationId: conv.id,
        role: 'assistant',
        content: 'Hi there! I\'m an OpenClaw bot powered by LaunchTerminal. I can help you with a variety of tasks.',
        platform: 'web',
        userId: 'bot',
        tokenCount: 24,
        latencyMs: 342,
      },
    ]);
  }

  logger.info('Database seed complete');
  process.exit(0);
}

seed().catch((error: Error) => {
  logger.error({ error }, 'Seed failed');
  process.exit(1);
});
