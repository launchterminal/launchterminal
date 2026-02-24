import type { Logger } from 'pino';
import type { LaunchTerminalConfig } from '@/config/schema';
import type { Adapter, UnifiedMessage, BotResponse } from '@/core/types';
import { nanoid } from 'nanoid';

type MessageHandler = (message: UnifiedMessage) => void;

export class DiscordAdapter implements Adapter {
  readonly platform = 'discord' as const;
  private readonly config: LaunchTerminalConfig;
  private readonly logger: Logger;
  private client: unknown;
  private handlers: MessageHandler[] = [];

  constructor(config: LaunchTerminalConfig, logger: Logger) {
    this.config = config;
    this.logger = logger.child({ adapter: 'discord' });
  }

  async connect(): Promise<void> {
    const { Client, GatewayIntentBits } = await import('discord.js');

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
    });

    const client = this.client as {
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      login: (token: string) => Promise<void>;
      user?: { tag: string };
    };

    client.on('ready', () => {
      this.logger.info({ tag: client.user?.tag }, 'Discord bot connected');
    });

    client.on('messageCreate', (msg: Record<string, unknown>) => {
      if (msg['author'] && (msg['author'] as Record<string, unknown>)['bot']) return;

      const unified: UnifiedMessage = {
        id: nanoid(),
        platform: 'discord',
        channelId: msg['channelId'] as string,
        userId: (msg['author'] as Record<string, string>)['id'],
        username: (msg['author'] as Record<string, string>)['username'],
        content: msg['content'] as string,
        timestamp: new Date(),
        metadata: new Map(),
      };

      for (const handler of this.handlers) {
        handler(unified);
      }
    });

    await client.login(process.env.DISCORD_TOKEN!);
  }

  async disconnect(): Promise<void> {
    const client = this.client as { destroy: () => void } | undefined;
    client?.destroy();
    this.logger.info('Discord adapter disconnected');
  }

  onMessage(handler: MessageHandler): void {
    this.handlers.push(handler);
  }

  async send(channelId: string, response: BotResponse): Promise<void> {
    this.logger.debug({ channelId, requestId: response.requestId }, 'Sending Discord message');
    // Implementation uses discord.js channel.send()
  }
}
