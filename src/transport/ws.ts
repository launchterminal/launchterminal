import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'node:http';
import type { Logger } from 'pino';
import type { Engine } from '@/core/engine';
import type { LaunchTerminalConfig } from '@/config/schema';
import { createLogger } from '@/observability/logger';
import { nanoid } from 'nanoid';
import type { UnifiedMessage } from '@/core/types';

interface WsClient {
  id: string;
  ws: WebSocket;
  userId: string;
  lastPing: number;
}

const logger: Logger = createLogger('ws');

export async function createWsTransport(
  engine: Engine,
  config: LaunchTerminalConfig,
  _httpServer: Server,
): Promise<WebSocketServer> {
  const wsConfig = config.transport.websocket;

  const wss = new WebSocketServer({
    port: wsConfig.port,
    path: wsConfig.path,
    maxPayload: wsConfig.max_payload_bytes,
    perMessageDeflate: wsConfig.compression,
  });

  const clients = new Map<string, WsClient>();

  wss.on('connection', (ws: WebSocket) => {
    const clientId = nanoid(12);
    const client: WsClient = {
      id: clientId,
      ws,
      userId: 'anonymous',
      lastPing: Date.now(),
    };
    clients.set(clientId, client);

    logger.info({ clientId, total: clients.size }, 'WebSocket client connected');

    ws.on('message', async (data: Buffer) => {
      try {
        const payload = JSON.parse(data.toString()) as {
          type: string;
          message?: string;
          userId?: string;
        };

        if (payload.type === 'auth') {
          client.userId = payload.userId ?? 'anonymous';
          ws.send(JSON.stringify({ type: 'auth:ok', clientId }));
          return;
        }

        if (payload.type === 'ping') {
          client.lastPing = Date.now();
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (payload.type === 'message' && payload.message) {
          const unifiedMessage: UnifiedMessage = {
            id: nanoid(),
            platform: 'web',
            channelId: clientId,
            userId: client.userId,
            username: client.userId,
            content: payload.message,
            timestamp: new Date(),
            metadata: new Map([['transport', 'websocket']]),
          };

          const response = await engine.handleMessage(unifiedMessage);
          ws.send(JSON.stringify({ type: 'response', data: response }));
        }
      } catch (error) {
        logger.error({ clientId, error }, 'WebSocket message error');
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      logger.info({ clientId, total: clients.size }, 'WebSocket client disconnected');
    });

    ws.on('error', (error: Error) => {
      logger.error({ clientId, error: error.message }, 'WebSocket error');
    });
  });

  // Heartbeat monitor
  const heartbeatInterval = setInterval(() => {
    const now = Date.now();
    const timeout = wsConfig.heartbeat_interval_ms * 2;

    for (const [id, client] of clients) {
      if (now - client.lastPing > timeout) {
        logger.warn({ clientId: id }, 'Client heartbeat timeout, disconnecting');
        client.ws.terminate();
        clients.delete(id);
      }
    }
  }, wsConfig.heartbeat_interval_ms);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  logger.info({ port: wsConfig.port, path: wsConfig.path }, 'WebSocket server started');
  return wss;
}
