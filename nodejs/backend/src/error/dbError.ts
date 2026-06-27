import { AppError, EmailTakenError, InternalError } from './AppError';

/** Shape of the fields `pg` attaches to errors raised by Postgres itself. */
interface PgDatabaseError extends Error {
  code?: string;
}

function isPgDatabaseError(err: unknown): err is PgDatabaseError {
  return err instanceof Error && typeof (err as PgDatabaseError).code === 'string';
}

/**
 * Converts a raw error from a `pg` query into an AppError.a unique violation
 * (Postgres code 23505) on email becomes the same 409 a  normal duplicate
 * signup would get, instead of leaking a generic 500. Anything else
 * becomes an InternalError (logged, not exposed to the client).
 */
export function mapDbError(err: unknown): AppError {
  if (isPgDatabaseError(err) && err.code === '23505') {
    return new EmailTakenError();
  }

  const message = err instanceof Error ? err.message : String(err);
  return new InternalError(`database error: ${message}`);
}
