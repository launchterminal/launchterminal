import type { Logger } from 'pino';
import type { PluginRegistry } from './registry';
import type { UnifiedMessage, Middleware } from './types';

export class Pipeline {
  private readonly middlewares: Middleware[] = [];
  private readonly registry: PluginRegistry;
  private readonly logger: Logger;

  constructor(registry: PluginRegistry, logger: Logger) {
    this.registry = registry;
    this.logger = logger.child({ component: 'pipeline' });
  }

  use(names: string[]): void {
    for (const name of names) {
      const plugin = this.registry.get(name);
      if (plugin?.onMessage) {
        this.middlewares.push({
          name,
          priority: plugin.priority ?? 100,
          handler: plugin.onMessage.bind(plugin),
        });
        this.logger.debug({ middleware: name }, 'Middleware registered');
      }
    }

    // Sort by priority (lower = earlier in chain)
    this.middlewares.sort((a, b) => a.priority - b.priority);
    this.logger.info({ order: this.middlewares.map((m) => m.name) }, 'Pipeline built');
  }

  async execute(message: UnifiedMessage): Promise<UnifiedMessage> {
    let current = { ...message };

    for (const middleware of this.middlewares) {
      const startTime = performance.now();

      try {
        current = await middleware.handler(current);

        const duration = performance.now() - startTime;
        this.logger.debug({ middleware: middleware.name, duration: `${duration.toFixed(2)}ms` }, 'Middleware executed');

        // Short-circuit if message is blocked
        if (current.blocked) {
          this.logger.info({ middleware: middleware.name, reason: current.blockReason }, 'Pipeline short-circuited');
          break;
        }
      } catch (error) {
        this.logger.error({ middleware: middleware.name, error }, 'Middleware error');
        throw new PipelineError(`Middleware "${middleware.name}" failed`, { cause: error });
      }
    }

    return current;
  }

  get length(): number {
    return this.middlewares.length;
  }
}

export class PipelineError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PipelineError';
  }
}
