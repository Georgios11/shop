import { StatusCodes } from 'http-status-codes';

export class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = StatusCodes.NOT_FOUND;

    // Ensures the prototype chain is correct, especially for built-in errors in TypeScript
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = StatusCodes.BAD_REQUEST;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthenticatedError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'UnauthenticatedError';
    this.statusCode = StatusCodes.UNAUTHORIZED;

    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }
}

export class UnauthorizedError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = StatusCodes.FORBIDDEN;

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
export class InternalServerError extends Error {
  statusCode: number;

  constructor(message: string = 'Internal Server Error') {
    super(message);

    this.name = 'InternalServerError';
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    // Correct the prototype chain
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
