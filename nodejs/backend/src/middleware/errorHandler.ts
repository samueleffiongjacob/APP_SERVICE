import { Request, Response, NextFunction } from 'express';
import { AppError } from '../error/AppError';

/**
 * Must be registered LAST, after all routes. Express identifies error
 * middleware purely by arity (4 params) this is the framework's one
 * place that turns any thrown error into the right HTTP response.
 *
 * Works for both thrown errors in sync handlers and rejected promises
 * in async handlers Express 5 forwards async rejections to this
 * automatically, which Express 4 did not do.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (!err.expose) {
      console.error('internal error:', err.message, err.stack);
    }
    res.status(err.statusCode).json({
      error: err.expose ? err.message : 'internal server error',
    });
    return;
  }

  /**  Anything that wasn't deliberately thrown as an AppError a real
    bug, a library throwing something unexpected, etc.
  */
  console.error('unhandled error:', err);
  res.status(500).json({ error: 'internal server error' });
}

/** 404 fallback for routes that don't match anything. Register just
 * before errorHandler, after all real routes. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `no route for ${req.method} ${req.path}` });
}
