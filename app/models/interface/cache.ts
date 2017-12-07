/**
 * Cache
 */
export interface Cache<T> {
  key: string;
  createdAt: Date;
  value: T;
}
