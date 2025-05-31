import { Request, Response, NextFunction } from 'express';
import { MongoError } from 'mongodb';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    return;
  }

  if (err instanceof MongoError) {
    if (err.code === 11000) { // Duplicate key error
      res.status(409).json({
        status: 'fail',
        message: 'Duplicate field value entered',
      });
      return;
    }
    res.status(500).json({
      status: 'error',
      message: 'Database error occurred',
    });
    return;
  }

  // Log error for debugging
  console.error('Error:', err);

  // Default error response
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
}; 