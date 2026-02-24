import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, index } from 'drizzle-orm/pg-core';

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  platform: text('platform').notNull(),
  channelId: text('channel_id').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  messageCount: integer('message_count').default(0).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
}, (table) => ({
  userIdIdx: index('conversations_user_id_idx').on(table.userId),
  platformIdx: index('conversations_platform_idx').on(table.platform),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  platform: text('platform').notNull(),
  userId: text('user_id').notNull(),
  tokenCount: integer('token_count'),
  latencyMs: integer('latency_ms'),
  blocked: boolean('blocked').default(false).notNull(),
  blockReason: text('block_reason'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index('messages_conversation_id_idx').on(table.conversationId),
  userIdIdx: index('messages_user_id_idx').on(table.userId),
  createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
}));

export const plugins = pgTable('plugins', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(),
  version: text('version').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  config: jsonb('config').$type<Record<string, unknown>>(),
  installedAt: timestamp('installed_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  keyHash: text('key_hash').unique().notNull(),
  permissions: jsonb('permissions').$type<string[]>().default([]).notNull(),
  rateLimit: integer('rate_limit').default(100),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  revoked: boolean('revoked').default(false).notNull(),
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  action: text('action').notNull(),
  actor: text('actor').notNull(),
  resource: text('resource').notNull(),
  resourceId: text('resource_id'),
  details: jsonb('details').$type<Record<string, unknown>>(),
  ip: text('ip'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  actionIdx: index('audit_log_action_idx').on(table.action),
  actorIdx: index('audit_log_actor_idx').on(table.actor),
  timestampIdx: index('audit_log_timestamp_idx').on(table.timestamp),
}));
