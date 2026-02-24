import type { Logger } from 'pino';
import type { LaunchTerminalConfig } from '@/config/schema';
import type { Adapter, UnifiedMessage, BotResponse } from '@/core/types';

type MessageHandler = (message: UnifiedMessage) => void;

export class WebAdapter implements Adapter {
  readonly platform = 'web' as const;
  private readonly config: LaunchTerminalConfig;
  private readonly logger: Logger;
  private handlers: MessageHandler[] = [];

  constructor(config: LaunchTerminalConfig, logger: Logger) {
    this.config = config;
    this.logger = logger.child({ adapter: 'web' });
  }

  async connect(): Promise<void> {
    // Web adapter is passive — it receives messages via HTTP transport
    this.logger.info('Web adapter initialized');
  }

  async disconnect(): Promise<void> {
    this.logger.info('Web adapter disconnected');
  }

  onMessage(handler: MessageHandler): void {
    this.handlers.push(handler);
  }

  dispatchMessage(message: UnifiedMessage): void {
    for (const handler of this.handlers) {
      handler(message);
    }
  }

  async send(_channelId: string, response: BotResponse): Promise<void> {
    // Web responses are returned directly via HTTP
    this.logger.debug({ requestId: response.requestId }, 'Web response prepared');
  }
}
