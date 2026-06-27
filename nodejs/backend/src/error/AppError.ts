/**
 * Base error type every layer throws. Carries an HTTP status so the
 * centralized error handling middleware (middleware/errorHandler.ts)
 * can map it to a response without each controller knowing status
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly expose: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('invalid credentials', 401);
  }
}

export class EmailTakenError extends AppError {
  constructor() {
    super('email already registered', 409);
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super('user not found', 404);
  }
}

export class LeadRequestNotFoundError extends AppError {
  constructor() {
    super('request not found', 404);
  }
}

/**
 * Anything unexpected (DB connection drop, programming error, etc).
 * `expose = false` means the error-handler logs the real message but
 * sends a generic one to the client.
 */
export class InternalError extends AppError {
  constructor(message: string) {
    super(message, 500, false);
  }
}
