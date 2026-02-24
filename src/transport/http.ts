import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import type { Server } from 'node:http';
import type { Engine } from '@/core/engine';
import type { LaunchTerminalConfig } from '@/config/schema';
import { nanoid } from 'nanoid';
import type { UnifiedMessage } from '@/core/types';

interface ChatRequest {
  message: string;
  userId?: string;
  sessionId?: string;
}

export async function createHttpTransport(
  engine: Engine,
  config: LaunchTerminalConfig,
): Promise<Server> {
  const app: FastifyInstance = Fastify({
    logger: false,
    requestIdHeader: 'x-request-id',
    genReqId: () => nanoid(12),
  });

  // CORS
  await app.register(import('@fastify/cors'), {
    origin: config.platforms.web?.cors?.origins ?? ['*'],
    credentials: config.platforms.web?.cors?.credentials ?? true,
  });

  // Rate limiting
  await app.register(import('@fastify/rate-limit'), {
    max: config.platforms.web?.rate_limit?.max ?? 100,
    timeWindow: config.platforms.web?.rate_limit?.window_ms ?? 60000,
  });

  // Health check endpoints
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  app.get('/ready', async () => ({
    status: 'ready',
    version: '2.4.0',
    uptime: process.uptime(),
  }));

  // Chat endpoint
  app.post<{ Body: ChatRequest }>('/api/v1/chat', async (request, reply) => {
    const { message, userId, sessionId } = request.body;

    const unifiedMessage: UnifiedMessage = {
      id: nanoid(),
      platform: 'web',
      channelId: sessionId ?? nanoid(),
      userId: userId ?? 'anonymous',
      username: 'web-user',
      content: message,
      timestamp: new Date(),
      metadata: new Map([
        ['requestId', request.id],
        ['ip', request.ip],
        ['userAgent', request.headers['user-agent']],
      ]),
    };

    const response = await engine.handleMessage(unifiedMessage);
    return reply.send(response);
  });

  // Metrics endpoint (Prometheus)
  if (config.observability.metrics.enabled) {
    app.get('/metrics', async (_request, reply) => {
      const { register } = await import('prom-client');
      const metrics = await register.metrics();
      return reply.type('text/plain').send(metrics);
    });
  }

  const port = config.platforms.web?.port ?? 3000;
  await app.listen({ port, host: '0.0.0.0' });

  return app.server;
}
