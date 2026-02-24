import { z } from 'zod';

const botSchema = z.object({
  name: z.string().min(1).max(64),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  personality: z.enum(['friendly', 'professional', 'witty', 'concise', 'custom']),
  language: z.string().default('en'),
  description: z.string().optional(),
});

const engineSchema = z.object({
  provider: z.string().default('openclaw'),
  model: z.string().default('claw-v2-turbo'),
  max_tokens: z.number().int().min(1).max(128000).default(4096),
  temperature: z.number().min(0).max(2).default(0.7),
  top_p: z.number().min(0).max(1).default(0.95),
  streaming: z.boolean().default(true),
  timeout_ms: z.number().int().min(1000).max(120000).default(30000),
  retry: z.object({
    max_attempts: z.number().int().min(0).max(10).default(3),
    backoff_ms: z.number().int().default(1000),
    backoff_multiplier: z.number().default(2),
  }).default({}),
});

const discordPlatformSchema = z.object({
  enabled: z.boolean().default(false),
  prefix: z.string().default('!'),
  slash_commands: z.boolean().default(true),
  guilds: z.array(z.string()).default(['*']),
  intents: z.array(z.string()).optional(),
  presence: z.object({
    status: z.enum(['online', 'idle', 'dnd', 'invisible']).default('online'),
    activity: z.object({
      type: z.string().default('WATCHING'),
      name: z.string().default('for commands'),
    }).optional(),
  }).optional(),
});

const slackPlatformSchema = z.object({
  enabled: z.boolean().default(false),
  signing_secret: z.string().optional(),
  socket_mode: z.boolean().default(true),
  app_token: z.string().optional(),
});

const telegramPlatformSchema = z.object({
  enabled: z.boolean().default(false),
  webhook_url: z.string().url().optional(),
  allowed_updates: z.array(z.string()).optional(),
});

const webPlatformSchema = z.object({
  enabled: z.boolean().default(true),
  port: z.number().int().min(1).max(65535).default(3000),
  cors: z.object({
    origins: z.array(z.string()).default(['*']),
    credentials: z.boolean().default(true),
  }).optional(),
  rate_limit: z.object({
    max: z.number().int().default(100),
    window_ms: z.number().int().default(60000),
  }).optional(),
});

const pluginConfigSchema = z.object({
  name: z.string(),
  enabled: z.boolean().default(true),
  path: z.string().optional(),
  config: z.record(z.unknown()).optional(),
  dependencies: z.array(z.string()).optional(),
});

const observabilitySchema = z.object({
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    format: z.enum(['json', 'pretty']).default('json'),
    redact: z.array(z.string()).optional(),
  }).default({}),
  metrics: z.object({
    enabled: z.boolean().default(true),
    path: z.string().default('/metrics'),
    default_labels: z.record(z.string()).optional(),
  }).default({}),
  tracing: z.object({
    enabled: z.boolean().default(false),
    exporter: z.enum(['otlp', 'jaeger', 'zipkin']).default('otlp'),
    endpoint: z.string().optional(),
    sample_rate: z.number().min(0).max(1).default(0.1),
  }).default({}),
  health: z.object({
    enabled: z.boolean().default(true),
    path: z.string().default('/health'),
    readiness_path: z.string().default('/ready'),
  }).default({}),
});

const databaseSchema = z.object({
  provider: z.enum(['postgres', 'sqlite']).default('postgres'),
  url: z.string(),
  pool: z.object({
    min: z.number().int().default(5),
    max: z.number().int().default(20),
    idle_timeout_ms: z.number().int().default(10000),
  }).default({}),
  ssl: z.boolean().default(true),
  migrations: z.object({
    auto_run: z.boolean().default(true),
    directory: z.string().default('src/db/migrations'),
  }).default({}),
});

export const launchTerminalConfigSchema = z.object({
  bot: botSchema,
  engine: engineSchema.default({}),
  platforms: z.object({
    discord: discordPlatformSchema.optional(),
    slack: slackPlatformSchema.optional(),
    telegram: telegramPlatformSchema.optional(),
    web: webPlatformSchema.default({}),
  }),
  plugins: z.array(pluginConfigSchema).default([]),
  pipeline: z.object({
    middleware: z.array(z.string()).default([]),
  }).default({}),
  transport: z.object({
    websocket: z.object({
      enabled: z.boolean().default(true),
      port: z.number().int().default(3001),
      path: z.string().default('/ws'),
      heartbeat_interval_ms: z.number().int().default(30000),
      max_payload_bytes: z.number().int().default(1048576),
      compression: z.boolean().default(true),
    }).default({}),
    grpc: z.object({
      enabled: z.boolean().default(false),
      port: z.number().int().default(50051),
      reflection: z.boolean().default(true),
    }).default({}),
  }).default({}),
  observability: observabilitySchema.default({}),
  database: databaseSchema,
  cache: z.object({
    provider: z.enum(['redis', 'memory']).default('redis'),
    url: z.string().optional(),
    prefix: z.string().default('lt:'),
    default_ttl_seconds: z.number().int().default(300),
  }).default({}),
});

export type LaunchTerminalConfig = z.infer<typeof launchTerminalConfigSchema>;
