import type { Logger } from 'pino';

// ---- Messages ----

export type Platform = 'discord' | 'slack' | 'telegram' | 'web';

export interface UnifiedMessage {
  id: string;
  platform: Platform;
  channelId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  metadata: Map<string, unknown>;
  blocked?: boolean;
  blockReason?: string;
}

export interface BotResponse {
  requestId: string;
  content: string;
  blocked: boolean;
  embeds?: Embed[];
  attachments?: Attachment[];
}

export interface Embed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
}

export interface Attachment {
  filename: string;
  contentType: string;
  data: Buffer;
}

// ---- Plugins ----

export interface Plugin {
  name: string;
  version: string;
  priority?: number;
  dependencies?: string[];
  onInit?(ctx: PluginContext): Promise<void>;
  onMessage?(message: UnifiedMessage): Promise<UnifiedMessage>;
  onResponse?(response: BotResponse): Promise<BotResponse>;
  onDestroy?(): Promise<void>;
}

export interface PluginContext {
  config: Record<string, unknown>;
  logger: Logger;
}

export interface PluginConfig {
  name: string;
  enabled: boolean;
  path?: string;
  config?: Record<string, unknown>;
  dependencies?: string[];
}

// ---- Pipeline ----

export interface Middleware {
  name: string;
  priority: number;
  handler: (message: UnifiedMessage) => Promise<UnifiedMessage>;
}

// ---- Adapters ----

export interface Adapter {
  platform: Platform;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onMessage(handler: (message: UnifiedMessage) => void): void;
  send(channelId: string, response: BotResponse): Promise<void>;
}

// ---- Events ----

export type EventType =
  | 'message:received'
  | 'message:responded'
  | 'message:error'
  | 'plugin:loaded'
  | 'plugin:error'
  | 'adapter:connected'
  | 'adapter:disconnected';

export interface Event<T = unknown> {
  type: EventType;
  timestamp: Date;
  data: T;
}
