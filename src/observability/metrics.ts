import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { createLogger } from './logger';

const logger = createLogger('metrics');

export const register = new Registry();

// HTTP metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'] as const,
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// Bot metrics
export const messagesProcessedTotal = new Counter({
  name: 'messages_processed_total',
  help: 'Total number of messages processed',
  labelNames: ['platform', 'status'] as const,
  registers: [register],
});

export const messageProcessingDuration = new Histogram({
  name: 'message_processing_duration_seconds',
  help: 'Message processing duration in seconds',
  labelNames: ['platform'] as const,
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
  registers: [register],
});

export const activeConnections = new Gauge({
  name: 'ws_active_connections',
  help: 'Number of active WebSocket connections',
  registers: [register],
});

// Plugin metrics
export const pluginExecutionDuration = new Histogram({
  name: 'plugin_execution_duration_seconds',
  help: 'Plugin execution duration in seconds',
  labelNames: ['plugin_name'] as const,
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5],
  registers: [register],
});

export const pluginErrorsTotal = new Counter({
  name: 'plugin_errors_total',
  help: 'Total number of plugin errors',
  labelNames: ['plugin_name', 'error_type'] as const,
  registers: [register],
});

interface MetricsConfig {
  enabled: boolean;
  path: string;
  default_labels?: Record<string, string>;
}

export function initMetrics(config: MetricsConfig): void {
  if (!config.enabled) return;

  if (config.default_labels) {
    register.setDefaultLabels(config.default_labels);
  }

  collectDefaultMetrics({ register });
  logger.info({ path: config.path }, 'Prometheus metrics initialized');
}
