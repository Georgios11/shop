import { UserPayload } from './userPayload';

declare global {
  namespace Express {
    interface Request {
      user?: User; // Optional, in case req.user is sometimes undefined
    }
  }
}
