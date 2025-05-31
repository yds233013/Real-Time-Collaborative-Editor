import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Document } from 'mongoose';
import { IDocument } from '../models/Document';
import { AppError } from './errorHandler';

// Extend Express Request type to include user and document
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
      document?: Document & IDocument;
    }
  }
}

export const checkDocumentAccess: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError('Unauthorized', 401));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Rate limiting for document updates
export const rateLimiter = (windowMs: number, maxRequests: number): RequestHandler => {
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (!requests.has(ip)) {
      requests.set(ip, [now]);
      next();
      return;
    }

    const userRequests = requests.get(ip)!;
    const windowStart = now - windowMs;

    // Remove old requests outside the window
    while (userRequests.length > 0 && userRequests[0] < windowStart) {
      userRequests.shift();
    }

    if (userRequests.length >= maxRequests) {
      next(new AppError('Too many requests', 429));
      return;
    }

    userRequests.push(now);
    next();
  };
}; 