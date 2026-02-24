import type { Logger } from 'pino';
import type { LaunchTerminalConfig } from '@/config/schema';
import type { Adapter, UnifiedMessage, BotResponse } from '@/core/types';
import { nanoid } from 'nanoid';

type MessageHandler = (message: UnifiedMessage) => void;

export class TelegramAdapter implements Adapter {
  readonly platform = 'telegram' as const;
  private readonly config: LaunchTerminalConfig;
  private readonly logger: Logger;
  private bot: unknown;
  private handlers: MessageHandler[] = [];

  constructor(config: LaunchTerminalConfig, logger: Logger) {
    this.config = config;
    this.logger = logger.child({ adapter: 'telegram' });
  }

  async connect(): Promise<void> {
    const { Telegraf } = await import('telegraf');
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

    const bot = this.bot as {
      on: (event: string, handler: (ctx: Record<string, unknown>) => void) => void;
      launch: () => Promise<void>;
      stop: (signal?: string) => void;
    };

    bot.on('text', (ctx: Record<string, unknown>) => {
      const msg = ctx['message'] as Record<string, unknown>;
      const from = msg['from'] as Record<string, unknown>;
      const chat = msg['chat'] as Record<string, unknown>;

      const unified: UnifiedMessage = {
        id: nanoid(),
        platform: 'telegram',
        channelId: String(chat['id']),
        userId: String(from['id']),
        username: (from['username'] as string) ?? 'unknown',
        content: msg['text'] as string,
        timestamp: new Date(),
        metadata: new Map([['ctx', ctx]]),
      };

      for (const handler of this.handlers) {
        handler(unified);
      }
    });

    await bot.launch();
    this.logger.info('Telegram adapter connected');
  }

  async disconnect(): Promise<void> {
    const bot = this.bot as { stop: (signal?: string) => void } | undefined;
    bot?.stop('SIGINT');
    this.logger.info('Telegram adapter disconnected');
  }

  onMessage(handler: MessageHandler): void {
    this.handlers.push(handler);
  }

  async send(channelId: string, response: BotResponse): Promise<void> {
    this.logger.debug({ channelId, requestId: response.requestId }, 'Sending Telegram message');
  }
}
