export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const ORDER_STATUS = {
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const CART_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

export const PRODUCT_SORT_BY = {
  NEWEST_FIRST: 'newest',
  OLDEST_FIRST: 'oldest',
  ASCENDING: '1-10',
  DESCENDING: '10-1',
} as const;
