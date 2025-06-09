import type { Middleware, StateValue } from "./types";
/**
 * Creates an async middleware that can handle promises and async operations
 * @param handler The async middleware handler function
 * @returns A middleware function that can be used with the state system
 */
export declare const createAsyncMiddleware: <T extends StateValue>(handler: (path: string, nextValue: T, prevValue: T) => Promise<T | false>) => Middleware<T>;
/**
 * Creates a validation middleware that ensures state updates meet certain criteria
 * @param validator A function that validates the new state value
 * @returns A middleware function that validates updates
 */
export declare const createValidationMiddleware: <T extends StateValue>(validator: (path: string, nextValue: T, prevValue: T) => boolean | string) => Middleware<T>;
/**
 * Creates a middleware that logs all state updates
 * @param options Configuration options for logging
 */
export declare const createLoggingMiddleware: <T extends StateValue>(options?: {
    readonly logPath?: boolean;
    readonly logValue?: boolean;
    readonly logPrevValue?: boolean;
}) => Middleware<T>;
/**
 * Creates a middleware that debounces state updates
 * @param delay Delay in milliseconds
 */
export declare const createDebounceMiddleware: <T extends StateValue>(delay: number) => Middleware<T>;
/**
 * Creates a middleware that throttles state updates
 * @param limit Maximum number of updates per second
 */
export declare const createThrottleMiddleware: <T extends StateValue>(limit: number) => Middleware<T>;
/**
 * Creates a middleware that persists state to localStorage
 * @param key The localStorage key to use
 */
export declare const createPersistenceMiddleware: <T extends StateValue>(key: string) => Middleware<T>;
/**
 * Creates a middleware that only allows updates during specific time windows
 * @param allowedHours Array of hours (0-23) when updates are allowed
 */
export declare const createTimeWindowMiddleware: <T extends StateValue>(allowedHours: readonly number[]) => Middleware<T>;
