/**
 * Base type for all state values
 */
export type StateValue = unknown;
/**
 * Middleware function type for state updates
 */
export type Middleware<T extends StateValue> = {
    (path: string, nextValue: T, prevValue: T): T | false | Promise<T | false>;
    __brand?: symbol;
};
/**
 * Configuration options for the state store
 */
export interface StoreConfig<T extends StateValue> {
    /**
     * Initial state for the store
     */
    readonly initialState?: T;
    /**
     * Array of middleware functions to apply
     */
    readonly middleware?: readonly Middleware<T>[];
    /**
     * Whether to enable development mode features
     */
    readonly devMode?: boolean;
}
/**
 * Subscription callback type
 */
export type SubscriptionCallback<T extends StateValue> = {
    (value: T): void;
    readonly __brand: unique symbol;
};
/**
 * Unsubscribe function type
 */
export type Unsubscribe = {
    (): void;
    readonly __brand: unique symbol;
};
export declare const isMiddleware: <T extends StateValue>(fn: unknown) => fn is Middleware<T>;
export declare const isSubscriptionCallback: <T extends StateValue>(fn: unknown) => fn is SubscriptionCallback<T>;
