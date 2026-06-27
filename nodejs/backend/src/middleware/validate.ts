import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../error/AppError';

/**
 * Validates and parses `req.body` against a Zod schema, replacing the
 * body with the parsed (and trimmed/coerced) result. Equivalent to
 * calling `payload.validate()?` it runs *before*
 * the controller instead of inside the service. Express has no
 * built-in derive-macro equivalent, so this is the idiomatic substitute.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      next(new ValidationError(message));
      return;
    }

    req.body = result.data;
    next();
  };
}
