import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../error/AppError';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Rejects a malformed `:id` param with 400 before it reaches the
 * controller, this auto-rejects non-UUID path segments at the framework layer instead
 * of letting an invalid id silently fail deeper in the stack.
 */
export function validateUuidParam(paramName: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    /**
      Express types path params as `string | string[]` to account for
      patterns that can repeat a segment; a route param here is always
      a single string in practice, but we narrow explicitly rather than
      asserting, so a genuinely malformed request is still rejected
      cleanly instead of throwing inside the regex test.
    */
    if (typeof value !== 'string' || !UUID_RE.test(value)) {
      next(new ValidationError(`${paramName} must be a valid UUID`));
      return;
    }

    next();
  };
}
