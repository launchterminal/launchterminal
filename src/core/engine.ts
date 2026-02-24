import type { Logger } from 'pino';
import type { Pipeline } from './pipeline';
import type { PluginRegistry } from './registry';
import type { LaunchTerminalConfig } from '@/config/schema';
import type { Database } from '@/db/connection';

import { DiscordAdapter } from '@/adapters/discord';
import { SlackAdapter } from '@/adapters/slack';
import { TelegramAdapter } from '@/adapters/telegram';
import { WebAdapter } from '@/adapters/web';
import { EventBus } from './event-bus';
import { Scheduler } from './scheduler';
import { nanoid } from 'nanoid';

import type { UnifiedMessage, BotResponse, Adapter } from './types';

export interface EngineOptions {
  config: LaunchTerminalConfig;
  pipeline: Pipeline;
  registry: PluginRegistry;
  db: Database;
  logger: Logger;
}

export class Engine {
  private readonly config: LaunchTerminalConfig;
  private readonly pipeline: Pipeline;
  private readonly registry: PluginRegistry;
  private readonly db: Database;
  private readonly logger: Logger;
  private readonly eventBus: EventBus;
  private readonly scheduler: Scheduler;
  private readonly adapters: Map<string, Adapter> = new Map();

  constructor(options: EngineOptions) {
    this.config = options.config;
    this.pipeline = options.pipeline;
    this.registry = options.registry;
    this.db = options.db;
    this.logger = options.logger.child({ component: 'engine' });
    this.eventBus = new EventBus(this.logger);
    this.scheduler = new Scheduler(this.logger);
  }

  async initAdapters(): Promise<void> {
    const { platforms } = this.config;

    if (platforms.discord?.enabled) {
      const discord = new DiscordAdapter(this.config, this.logger);
      await discord.connect();
      discord.onMessage((msg) => void this.handleMessage(msg));
      this.adapters.set('discord', discord);
    }

    if (platforms.slack?.enabled) {
      const slack = new SlackAdapter(this.config, this.logger);
      await slack.connect();
      slack.onMessage((msg) => void this.handleMessage(msg));
      this.adapters.set('slack', slack);
    }

    if (platforms.telegram?.enabled) {
      const telegram = new TelegramAdapter(this.config, this.logger);
      await telegram.connect();
      telegram.onMessage((msg) => void this.handleMessage(msg));
      this.adapters.set('telegram', telegram);
    }

    // Web adapter is always available via HTTP transport
    const web = new WebAdapter(this.config, this.logger);
    this.adapters.set('web', web);

    this.logger.info({ adapters: [...this.adapters.keys()] }, 'Adapters initialized');
  }

  async handleMessage(message: UnifiedMessage): Promise<BotResponse> {
    const requestId = nanoid(12);
    const startTime = performance.now();

    this.logger.debug({ requestId, platform: message.platform, userId: message.userId }, 'Processing message');

    try {
      // Run through pipeline (middleware chain)
      const processedMessage = await this.pipeline.execute(message);

      if (processedMessage.blocked) {
        this.logger.info({ requestId, reason: processedMessage.blockReason }, 'Message blocked by pipeline');
        return { requestId, content: processedMessage.blockReason ?? 'Message blocked', blocked: true };
      }

      // Generate response via OpenClaw API
      const response = await this.generateResponse(processedMessage);

      // Emit event for plugins
      this.eventBus.emit('message:responded', { requestId, message, response });

      const duration = performance.now() - startTime;
      this.logger.info({ requestId, duration: `${duration.toFixed(2)}ms` }, 'Message processed');

      return response;
    } catch (error) {
      this.logger.error({ requestId, error }, 'Error processing message');
      this.eventBus.emit('message:error', { requestId, message, error });
      throw error;
    }
  }

  private async generateResponse(message: UnifiedMessage): Promise<BotResponse> {
    const { engine: engineConfig } = this.config;

    // Call OpenClaw API
    const response = await fetch('https://api.openclaw.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENCLAW_API_KEY}`,
        'X-Request-ID': message.metadata?.get('requestId') as string,
      },
      body: JSON.stringify({
        model: engineConfig.model,
        messages: [
          { role: 'system', content: this.buildSystemPrompt() },
          { role: 'user', content: message.content },
        ],
        max_tokens: engineConfig.max_tokens,
        temperature: engineConfig.temperature,
        top_p: engineConfig.top_p,
        stream: engineConfig.streaming,
      }),
      signal: AbortSignal.timeout(engineConfig.timeout_ms),
    });

    if (!response.ok) {
      throw new Error(`OpenClaw API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };

    return {
      requestId: message.metadata?.get('requestId') as string,
      content: data.choices[0]?.message?.content ?? '',
      blocked: false,
    };
  }

  private buildSystemPrompt(): string {
    const { bot } = this.config;
    return `You are ${bot.name}, a ${bot.personality} AI assistant. ${bot.description ?? ''}`;
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down engine');
    this.scheduler.stopAll();

    for (const [name, adapter] of this.adapters) {
      this.logger.info({ adapter: name }, 'Disconnecting adapter');
      await adapter.disconnect();
    }

    this.adapters.clear();
    this.logger.info('Engine shut down complete');
  }
}

export function createEngine(options: EngineOptions): Engine {
  return new Engine(options);
}
