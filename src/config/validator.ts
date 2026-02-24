import { launchTerminalConfigSchema } from './schema';
import type { LaunchTerminalConfig } from './schema';
import { createLogger } from '@/observability/logger';

const logger = createLogger('config-validator');

export function validateConfig(raw: Record<string, unknown>): LaunchTerminalConfig {
  const result = launchTerminalConfigSchema.safeParse(raw);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    logger.error({ errors }, 'Configuration validation failed');

    const formattedErrors = errors
      .map((e) => `  - ${e.path}: ${e.message}`)
      .join('\n');

    throw new ConfigValidationError(
      `Invalid configuration:\n${formattedErrors}`,
      errors,
    );
  }

  logger.info('Configuration validated successfully');
  return result.data;
}

export class ConfigValidationError extends Error {
  readonly errors: Array<{ path: string; message: string; code: string }>;

  constructor(
    message: string,
    errors: Array<{ path: string; message: string; code: string }>,
  ) {
    super(message);
    this.name = 'ConfigValidationError';
    this.errors = errors;
  }
}
