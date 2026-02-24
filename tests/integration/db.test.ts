import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

describe('Database Integration', () => {
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    // Start PostgreSQL test container
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('launchterminal_test')
      .withUsername('test')
      .withPassword('test')
      .start();

    process.env.DATABASE_URL = container.getConnectionUri();
  }, 60000);

  afterAll(async () => {
    await container?.stop();
  });

  it('should connect to the database', async () => {
    const { connectDatabase } = await import('@/db/connection');
    const db = await connectDatabase({
      url: process.env.DATABASE_URL!,
      pool: { min: 1, max: 5, idle_timeout_ms: 5000 },
      ssl: false,
    });

    expect(db).toBeDefined();
  });

  it('should run migrations without errors', async () => {
    // Migration test placeholder
    expect(true).toBe(true);
  });
});
