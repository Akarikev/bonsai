/**
 * Middleware function type for state updates
 * @param path The path being updated
 * @param nextValue The new value being set
 * @param prevValue The previous value
 * @returns The value to set, or false to block the update
 */
export type Middleware<T> = (
  path: string,
  nextValue: T,
  prevValue: T
) => T | false | Promise<T | false>;

/**
 * Configuration options for the state store
 */
export interface StoreConfig<T> {
  /**
   * Initial state for the store
   */
  initialState?: T;

  /**
   * Array of middleware functions to apply
   */
  middleware?: Middleware<T>[];

  /**
   * Whether to enable development mode features
   */
  devMode?: boolean;
}

/**
 * Subscription callback type
 */
export type SubscriptionCallback<T> = (value: T) => void;

/**
 * Unsubscribe function type
 */
export type Unsubscribe = () => void;
