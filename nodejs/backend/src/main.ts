import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { pool } from './config/db';
import { logRequests } from './middleware/logging';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import { UserRepository } from './repository/UserRepository';
import { LeadRequestRepository } from './repository/LeadRequestRepository';

import { AuthService } from './service/AuthService';
import { UserService } from './service/UserService';
import { LeadRequestService } from './service/LeadRequestService';

import { AuthController } from './controller/authController';
import { UserController } from './controller/userController';
import { LeadRequestController } from './controller/leadRequestController';
import { health } from './controller/healthController';

import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { leadRequestRoutes } from './routes/leadRequestRoutes';

/**
 * Runs this project's own migrations (migrations/ at the repo root) —
 * see that folder for why these are an independent copy of the schema
 * rather than a dependency on the Rust implementation. Safe to call on
 * every startup: node-pg-migrate tracks applied migrations in its own
 * `pgmigrations` table and no-ops if there's nothing new to run.
 *
 * Runs before the Express server starts listening, so the app never
 * accepts traffic against a schema it hasn't verified exists yet.
 *
 * node-pg-migrate v8 ships as an ESM-only package, while this project
 * is deliberately CommonJS — a static `import` here would fail to
 * compile (TS1479). Dynamic `import()` works from a CJS file even
 * when the imported package is ESM-only, so that's used instead of
 * switching this whole project to ESM just for one dependency.
*/

async function runMigrations(): Promise<void> {
  const { runner } = await import('node-pg-migrate');
  await runner({
    databaseUrl: config.databaseUrl,
    dir: path.join(__dirname, '..', 'migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations',
    log: (msg: string) => console.log(`[migrate] ${msg}`),
  });
}

async function main(): Promise<void> {
  await runMigrations();
  /**  Composition root — wires repositories into services into
    controllers 
  */
  const userRepo = new UserRepository(pool);
  const leadRequestRepo = new LeadRequestRepository(pool);

  const authService = new AuthService(userRepo);
  const userService = new UserService(userRepo);
  const leadRequestService = new LeadRequestService(leadRequestRepo);

  const authController = new AuthController(authService);
  const userController = new UserController(userService);
  const leadRequestController = new LeadRequestController(leadRequestService);

  const app = express();

  // Enable CORS for all origins
  // app.use(cors());
  app.use(cors({
    origin: [
      'http://localhost:3000',
    ],
  }));

  app.use(express.json());
  app.use(logRequests);

  app.get('/health', health);
  app.use('/api/auth', authRoutes(authController));
  app.use('/api/users', userRoutes(userController));
  app.use('/api/requests', leadRequestRoutes(leadRequestController));

  // Must come after all real routes, before the error handler.
  app.use(notFoundHandler);
  /**
    Must be registered last Express identifies it as an error handler
    by its 4-argument signature.
  */
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`listening on 0.0.0.0:${config.port}`);
  });
}

main().catch((err) =>{
  /** 
    If migrations fail (bad DATABASE_URL, Postgres unreachable, a
    genuinely broken migration file), the process must not silently
    start serving traffic against a schema it never confirmed exists.
    Exiting non-zero here is also what lets systemd's Restart=on-failure
    or Docker's restart policy retry automatically.
  */
  console.error('fatal error during startup:', err);
  process.exit(1);
})