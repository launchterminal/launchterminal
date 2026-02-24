import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { createLogger } from '@/observability/logger';

const logger = createLogger('config-loader');

const CONFIG_FILES = [
  'claw.config.yml',
  'claw.config.yaml',
  'claw.config.json',
  '.clawrc.yml',
  '.clawrc.json',
];

export async function loadConfig(configPath?: string): Promise<Record<string, unknown>> {
  const searchPaths = configPath ? [configPath] : CONFIG_FILES.map((f) => resolve(process.cwd(), f));

  for (const filePath of searchPaths) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const parsed = filePath.endsWith('.json')
        ? (JSON.parse(content) as Record<string, unknown>)
        : (parse(content) as Record<string, unknown>);

      // Resolve environment variable placeholders: ${VAR_NAME}
      const resolved = resolveEnvVars(parsed);

      logger.info({ path: filePath }, 'Configuration loaded');
      return resolved;
    } catch {
      // Try next file
      continue;
    }
  }

  throw new Error(
    `No configuration file found. Searched: ${CONFIG_FILES.join(', ')}. ` +
    'Create a claw.config.yml or run `claw init --interactive`.',
  );
}

function resolveEnvVars(obj: unknown): Record<string, unknown> {
  if (typeof obj === 'string') {
    return obj.replace(/\$\{(\w+)\}/g, (_, key: string) => {
      return process.env[key] ?? '';
    }) as unknown as Record<string, unknown>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => resolveEnvVars(item)) as unknown as Record<string, unknown>;
  }

  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveEnvVars(value);
    }
    return result;
  }

  return obj as Record<string, unknown>;
}
