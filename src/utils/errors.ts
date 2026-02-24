export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id "${id}" not found` : `${resource} not found`,
      404,
      'NOT_FOUND',
    );
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends AppError {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

export class AdapterError extends AppError {
  readonly platform: string;

  constructor(platform: string, message: string) {
    super(`[${platform}] ${message}`, 502, 'ADAPTER_ERROR');
    this.name = 'AdapterError';
    this.platform = platform;
  }
}

export class PluginError extends AppError {
  readonly pluginName: string;

  constructor(pluginName: string, message: string) {
    super(`Plugin "${pluginName}": ${message}`, 500, 'PLUGIN_ERROR');
    this.name = 'PluginError';
    this.pluginName = pluginName;
  }
}
