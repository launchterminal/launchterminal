import type { Plugin, PluginContext, UnifiedMessage } from '@/core/types';
import type { Logger } from 'pino';

interface MemoryConfig {
  provider: 'redis' | 'in-memory';
  ttl_seconds: number;
  max_history: number;
}

interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default class MemoryPlugin implements Plugin {
  name = 'memory';
  version = '1.0.0';
  priority = 40;

  private config!: MemoryConfig;
  private logger!: Logger;
  private store: Map<string, ConversationEntry[]> = new Map();

  async onInit(ctx: PluginContext): Promise<void> {
    this.config = ctx.config as unknown as MemoryConfig;
    this.logger = ctx.logger;

    // Periodic cleanup of expired conversations
    setInterval(() => {
      const cutoff = Date.now() - this.config.ttl_seconds * 1000;
      for (const [key, entries] of this.store) {
        const filtered = entries.filter((e) => e.timestamp > cutoff);
        if (filtered.length === 0) {
          this.store.delete(key);
        } else {
          this.store.set(key, filtered);
        }
      }
    }, 60000);

    this.logger.info(
      { provider: this.config.provider, maxHistory: this.config.max_history },
      'Memory plugin initialized',
    );
  }

  async onMessage(message: UnifiedMessage): Promise<UnifiedMessage> {
    const key = `${message.platform}:${message.userId}`;

    // Retrieve conversation history
    const history = this.store.get(key) ?? [];

    // Add current message
    history.push({
      role: 'user',
      content: message.content,
      timestamp: Date.now(),
    });

    // Trim to max history
    while (history.length > this.config.max_history) {
      history.shift();
    }

    this.store.set(key, history);

    // Attach history to message metadata for the engine
    message.metadata.set('conversation_history', history);
    message.metadata.set('conversation_length', history.length);

    this.logger.debug({ userId: message.userId, historyLength: history.length }, 'Conversation history loaded');
    return message;
  }

  async onDestroy(): Promise<void> {
    this.store.clear();
    this.logger.info('Memory plugin destroyed');
  }
}
