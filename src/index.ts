import { config } from 'dotenv';
config();

import { createEngine } from '@/core/engine';
import { loadConfig } from '@/config/loader';
import { validateConfig } from '@/config/validator';
import { createLogger } from '@/observability/logger';
import { initMetrics } from '@/observability/metrics';
import { initTracer } from '@/observability/tracer';
import { createHttpTransport } from '@/transport/http';
import { createWsTransport } from '@/transport/ws';
import { PluginRegistry } from '@/core/registry';
import { Pipeline } from '@/core/pipeline';
import { connectDatabase } from '@/db/connection';

import type { LaunchTerminalConfig } from '@/config/schema';

const logger = createLogger('main');

async function bootstrap(): Promise<void> {
  logger.info('Starting LaunchTerminal v2.4.0');

  // Load and validate configuration
  const rawConfig = await loadConfig();
  const appConfig = validateConfig(rawConfig) as LaunchTerminalConfig;
  logger.info({ platforms: Object.keys(appConfig.platforms) }, 'Configuration loaded');

  // Initialize observability
  if (appConfig.observability.tracing.enabled) {
    await initTracer(appConfig.observability.tracing);
    logger.info('OpenTelemetry tracer initialized');
  }

  if (appConfig.observability.metrics.enabled) {
    initMetrics(appConfig.observability.metrics);
    logger.info('Prometheus metrics initialized');
  }

  // Connect to database
  const db = await connectDatabase(appConfig.database);
  logger.info('Database connected');

  // Initialize plugin registry
  const registry = new PluginRegistry(logger);
  await registry.loadPlugins(appConfig.plugins);
  logger.info({ count: registry.count }, 'Plugins loaded');

  // Build message pipeline
  const pipeline = new Pipeline(registry, logger);
  pipeline.use(appConfig.pipeline.middleware);

  // Create core engine
  const engine = createEngine({
    config: appConfig,
    pipeline,
    registry,
    db,
    logger,
  });

  // Start transports
  const httpServer = await createHttpTransport(engine, appConfig);
  logger.info({ port: appConfig.platforms.web.port }, 'HTTP server listening');

  if (appConfig.transport.websocket.enabled) {
    await createWsTransport(engine, appConfig, httpServer);
    logger.info({ port: appConfig.transport.websocket.port }, 'WebSocket server listening');
  }

  // Initialize platform adapters
  await engine.initAdapters();
  logger.info('Platform adapters initialized');

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully');
    await engine.shutdown();
    await registry.destroyAll();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  logger.info('LaunchTerminal is ready 🚀');
}

bootstrap().catch((err: Error) => {
  logger.fatal({ err }, 'Failed to start LaunchTerminal');
  process.exit(1);
});

export { bootstrap };
