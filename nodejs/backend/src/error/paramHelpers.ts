import { Request } from 'express';
import { InternalError } from './AppError';

/**
 * Express types `req.params[key]` as `string | string[]` to account for
 * routes that can match a param more than once. For the single-segment
 * params this app uses (`:id`), it's always a plain string in practice
 * `validateUuidParam` already confirmed that before the controller runs.
 * This just gives the controller a typed, narrowed value to work with
 * instead of re deriving the same check inline everywhere.
 *
 * Throwing InternalError (rather than silently casting) means a route
 * wired up without the validation middleware fails loudly instead of
 * passing an array into a query that expects a string.
 */
export function requireStringParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string') {
    throw new InternalError(`expected route param "${name}" to be a string`);
  }
  return value;
}
