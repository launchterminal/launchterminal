import pino from 'pino';
import type { Logger } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const baseLogger: Logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
  redact: {
    paths: ['*.password', '*.token', '*.apiKey', '*.secret', '*.authorization'],
    censor: '[REDACTED]',
  },
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  base: {
    service: 'launchterminal',
    version: '2.4.0',
    env: process.env.NODE_ENV ?? 'development',
  },
});

export function createLogger(component: string): Logger {
  return baseLogger.child({ component });
}

export { baseLogger as logger };
export type { Logger };
