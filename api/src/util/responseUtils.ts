import { NextFunction, Response } from 'express';
import { BadRequestError } from '../errors/apiError';
import { StatusCodes } from 'http-status-codes';

const successResponse = (
  res: Response,
  status: any,
  message: string,
  data: object = {}
): Response => {
  return res.status(status).json({
    ok: true,
    message,
    data,
    status,
  });
};
const errorResponse = (
  err: unknown,

  next: NextFunction
) => {
  if (err instanceof Error && err.name == 'ValidationError') {
    next(new BadRequestError(err.message));
  } else {
    next(err);
  }
};
export default {
  successResponse,
  errorResponse,
};
