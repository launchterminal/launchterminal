import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginRegistry } from '@/core/registry';
import pino from 'pino';

const logger = pino({ level: 'silent' });

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry(logger);
  });

  it('should start with zero plugins', () => {
    expect(registry.count).toBe(0);
  });

  it('should report has() correctly', () => {
    expect(registry.has('nonexistent')).toBe(false);
  });

  it('should return undefined for unknown plugins', () => {
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('should destroy all plugins gracefully', async () => {
    await expect(registry.destroyAll()).resolves.not.toThrow();
  });
});
