import { Document } from '../models/Document';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      document?: Document;
    }
  }
} 