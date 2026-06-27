import { Pool } from 'pg';
import { config } from './env';

/** 
 Connects to whatever Postgres DATABASE_URL points at. This service
  owns its own `users` / `lead_requests` schema and runs its own
  migrations automatically on startup (see migrations/ at the repo
  root and runMigrations() in main.ts).
*/

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  /**  Idle client errors (e.g. connection dropped) shouldn't crash the
    whole process — log and let the pool recover the connection.
  */
  console.error('Unexpected Postgres pool error', err);
});
