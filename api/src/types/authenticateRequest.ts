// types.ts
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string; 
    name?: string;
    email?: string;
    role?: string;
  };
}
