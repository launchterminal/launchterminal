import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Pipeline, PipelineError } from '@/core/pipeline';
import { PluginRegistry } from '@/core/registry';
import type { UnifiedMessage, Plugin } from '@/core/types';
import pino from 'pino';

const logger = pino({ level: 'silent' });

describe('Pipeline', () => {
  let registry: PluginRegistry;
  let pipeline: Pipeline;

  beforeEach(() => {
    registry = new PluginRegistry(logger);
    pipeline = new Pipeline(registry, logger);
  });

  it('should execute middleware in priority order', async () => {
    const executionOrder: string[] = [];

    const pluginA: Plugin = {
      name: 'plugin-a',
      version: '1.0.0',
      priority: 20,
      onMessage: vi.fn(async (msg: UnifiedMessage) => {
        executionOrder.push('a');
        return msg;
      }),
    };

    const pluginB: Plugin = {
      name: 'plugin-b',
      version: '1.0.0',
      priority: 10,
      onMessage: vi.fn(async (msg: UnifiedMessage) => {
        executionOrder.push('b');
        return msg;
      }),
    };

    // Manually register plugins for testing
    (registry as unknown as { plugins: Map<string, Plugin> }).plugins.set('plugin-a', pluginA);
    (registry as unknown as { plugins: Map<string, Plugin> }).plugins.set('plugin-b', pluginB);

    pipeline.use(['plugin-a', 'plugin-b']);

    const message = globalThis.testUtils.createMockMessage();
    await pipeline.execute(message);

    // plugin-b has lower priority (10), so it should run first
    expect(executionOrder).toEqual(['b', 'a']);
  });

  it('should short-circuit when message is blocked', async () => {
    const secondMiddleware = vi.fn();

    const blocker: Plugin = {
      name: 'blocker',
      version: '1.0.0',
      priority: 10,
      onMessage: vi.fn(async (msg: UnifiedMessage) => ({
        ...msg,
        blocked: true,
        blockReason: 'Rate limit exceeded',
      })),
    };

    const passthrough: Plugin = {
      name: 'passthrough',
      version: '1.0.0',
      priority: 20,
      onMessage: secondMiddleware,
    };

    (registry as unknown as { plugins: Map<string, Plugin> }).plugins.set('blocker', blocker);
    (registry as unknown as { plugins: Map<string, Plugin> }).plugins.set('passthrough', passthrough);

    pipeline.use(['blocker', 'passthrough']);

    const message = globalThis.testUtils.createMockMessage();
    const result = await pipeline.execute(message);

    expect(result.blocked).toBe(true);
    expect(result.blockReason).toBe('Rate limit exceeded');
    expect(secondMiddleware).not.toHaveBeenCalled();
  });

  it('should throw PipelineError when middleware fails', async () => {
    const failingPlugin: Plugin = {
      name: 'failing',
      version: '1.0.0',
      priority: 10,
      onMessage: vi.fn(async () => {
        throw new Error('Something went wrong');
      }),
    };

    (registry as unknown as { plugins: Map<string, Plugin> }).plugins.set('failing', failingPlugin);
    pipeline.use(['failing']);

    const message = globalThis.testUtils.createMockMessage();
    await expect(pipeline.execute(message)).rejects.toThrow(PipelineError);
  });

  it('should return unmodified message with empty pipeline', async () => {
    const message = globalThis.testUtils.createMockMessage({ content: 'test message' });
    const result = await pipeline.execute(message);

    expect(result.content).toBe('test message');
    expect(result.blocked).toBeUndefined();
  });

  it('should report correct pipeline length', () => {
    expect(pipeline.length).toBe(0);
  });
});
