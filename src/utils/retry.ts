import { createLogger } from '@/observability/logger';

const logger = createLogger('retry');

interface RetryOptions {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const defaultOptions: RetryOptions = {
  maxAttempts: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === opts.maxAttempts) {
        logger.error({ attempt, maxAttempts: opts.maxAttempts, error: lastError.message }, 'All retry attempts exhausted');
        break;
      }

      const delay = opts.backoffMs * Math.pow(opts.backoffMultiplier, attempt - 1);
      const jitter = delay * 0.1 * Math.random();
      const totalDelay = delay + jitter;

      logger.warn({ attempt, nextRetryMs: Math.round(totalDelay), error: lastError.message }, 'Retrying after error');
      opts.onRetry?.(attempt, lastError);

      await sleep(totalDelay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
