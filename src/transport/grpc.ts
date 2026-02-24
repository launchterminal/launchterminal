import type { Logger } from 'pino';
import type { Engine } from '@/core/engine';
import { createLogger } from '@/observability/logger';

const logger: Logger = createLogger('grpc');

interface GrpcConfig {
  port: number;
  reflection: boolean;
}

export async function createGrpcTransport(
  _engine: Engine,
  config: GrpcConfig,
): Promise<void> {
  const grpc = await import('@grpc/grpc-js');
  const protoLoader = await import('@grpc/proto-loader');

  const packageDefinition = await protoLoader.load('src/transport/proto/claw.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
  const server = new grpc.Server();

  const clawService = protoDescriptor['claw'] as Record<string, unknown>;
  const ClawService = clawService['ClawService'] as { service: unknown };

  server.addService(ClawService.service as grpc.ServiceDefinition, {
    chat: async (
      call: { request: { message: string; user_id: string } },
      callback: (err: Error | null, response: { content: string; request_id: string }) => void,
    ) => {
      try {
        logger.debug({ userId: call.request.user_id }, 'gRPC chat request');
        callback(null, {
          content: 'gRPC response placeholder',
          request_id: 'grpc-req-001',
        });
      } catch (error) {
        callback(error as Error, { content: '', request_id: '' });
      }
    },
  });

  server.bindAsync(
    `0.0.0.0:${config.port}`,
    grpc.ServerCredentials.createInsecure(),
    (err: Error | null) => {
      if (err) {
        logger.error({ error: err }, 'Failed to start gRPC server');
        return;
      }
      logger.info({ port: config.port }, 'gRPC server started');
    },
  );
}
