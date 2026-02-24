import type { Logger } from 'pino';
import type { LaunchTerminalConfig } from '@/config/schema';
import type { Adapter, UnifiedMessage, BotResponse } from '@/core/types';
import { nanoid } from 'nanoid';

type MessageHandler = (message: UnifiedMessage) => void;

export class SlackAdapter implements Adapter {
  readonly platform = 'slack' as const;
  private readonly config: LaunchTerminalConfig;
  private readonly logger: Logger;
  private app: unknown;
  private handlers: MessageHandler[] = [];

  constructor(config: LaunchTerminalConfig, logger: Logger) {
    this.config = config;
    this.logger = logger.child({ adapter: 'slack' });
  }

  async connect(): Promise<void> {
    const { App } = await import('slack-bolt' as string);

    this.app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: this.config.platforms.slack?.socket_mode ?? true,
      appToken: process.env.SLACK_APP_TOKEN,
    });

    const app = this.app as {
      message: (handler: (args: Record<string, unknown>) => Promise<void>) => void;
      start: () => Promise<void>;
    };

    app.message(async ({ message, say }: Record<string, unknown>) => {
      const msg = message as Record<string, string>;
      const unified: UnifiedMessage = {
        id: nanoid(),
        platform: 'slack',
        channelId: msg['channel'],
        userId: msg['user'],
        username: msg['user'],
        content: msg['text'],
        timestamp: new Date(),
        metadata: new Map([['say', say]]),
      };

      for (const handler of this.handlers) {
        handler(unified);
      }
    });

    await app.start();
    this.logger.info('Slack adapter connected (Socket Mode)');
  }

  async disconnect(): Promise<void> {
    this.logger.info('Slack adapter disconnected');
  }

  onMessage(handler: MessageHandler): void {
    this.handlers.push(handler);
  }

  async send(channelId: string, response: BotResponse): Promise<void> {
    this.logger.debug({ channelId, requestId: response.requestId }, 'Sending Slack message');
  }
}
