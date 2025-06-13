import { Document } from 'mongoose';

/**
 * Interface for cache document structure used in cache update utilities.
 */
export interface CacheDocument extends Document {
  _id: string;
  category?: {
    name?: string;
  };
}
