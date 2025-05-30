// types.ts
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string; // or _id if you prefer to keep the MongoDB default naming
    name?: string;
    email?: string;
    role?: string;
  };
}
