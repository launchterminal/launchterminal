import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { createLogger } from '@/observability/logger';

import * as schema from './models/schema';

const logger = createLogger('database');

export type Database = ReturnType<typeof drizzle>;

interface DatabaseConfig {
  url: string;
  pool: {
    min: number;
    max: number;
    idle_timeout_ms: number;
  };
  ssl: boolean;
}

export async function connectDatabase(config: DatabaseConfig): Promise<Database> {
  const pool = new pg.Pool({
    connectionString: config.url,
    min: config.pool.min,
    max: config.pool.max,
    idleTimeoutMillis: config.pool.idle_timeout_ms,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
  });

  // Test connection
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    client.release();
    logger.info({ serverTime: result.rows[0]?.now }, 'Database connection established');
  } catch (error) {
    logger.fatal({ error }, 'Failed to connect to database');
    throw error;
  }

  pool.on('error', (err: Error) => {
    logger.error({ error: err.message }, 'Unexpected database pool error');
  });

  return drizzle(pool, { schema });
}
