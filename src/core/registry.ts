import type { Logger } from 'pino';
import type { Plugin, PluginConfig } from './types';

export class PluginRegistry {
  private readonly plugins: Map<string, Plugin> = new Map();
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ component: 'registry' });
  }

  async loadPlugins(configs: PluginConfig[]): Promise<void> {
    const enabled = configs.filter((c) => c.enabled);
    this.logger.info({ total: configs.length, enabled: enabled.length }, 'Loading plugins');

    // Resolve dependencies and determine load order
    const ordered = this.resolveDependencies(enabled);

    for (const config of ordered) {
      try {
        const plugin = await this.loadPlugin(config);
        this.plugins.set(config.name, plugin);
        this.logger.info({ plugin: config.name, version: plugin.version }, 'Plugin loaded');
      } catch (error) {
        this.logger.error({ plugin: config.name, error }, 'Failed to load plugin');
        throw error;
      }
    }
  }

  private async loadPlugin(config: PluginConfig): Promise<Plugin> {
    // Try loading from built-in plugins first, then from path
    const modulePath = config.path ?? `@/plugins/${config.name}`;
    const module = (await import(modulePath)) as { default: new () => Plugin };
    const plugin = new module.default();

    if (plugin.onInit) {
      await plugin.onInit({
        config: config.config ?? {},
        logger: this.logger.child({ plugin: config.name }),
      });
    }

    return plugin;
  }

  private resolveDependencies(configs: PluginConfig[]): PluginConfig[] {
    // Topological sort based on declared dependencies
    const graph = new Map<string, string[]>();
    const configMap = new Map<string, PluginConfig>();

    for (const config of configs) {
      graph.set(config.name, config.dependencies ?? []);
      configMap.set(config.name, config);
    }

    const visited = new Set<string>();
    const sorted: PluginConfig[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);

      const deps = graph.get(name) ?? [];
      for (const dep of deps) {
        visit(dep);
      }

      const config = configMap.get(name);
      if (config) sorted.push(config);
    };

    for (const name of graph.keys()) {
      visit(name);
    }

    return sorted;
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  get count(): number {
    return this.plugins.size;
  }

  async destroyAll(): Promise<void> {
    for (const [name, plugin] of this.plugins) {
      try {
        if (plugin.onDestroy) {
          await plugin.onDestroy();
        }
        this.logger.debug({ plugin: name }, 'Plugin destroyed');
      } catch (error) {
        this.logger.error({ plugin: name, error }, 'Error destroying plugin');
      }
    }
    this.plugins.clear();
  }
}
