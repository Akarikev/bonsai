import type { Middleware, StoreConfig } from "./types";
/**
 * Tree-based state management system for Bonsai.
 * Provides a hierarchical state structure with path-based access, middleware support,
 * and subscription capabilities.
 *
 * @example
 * ```typescript
 * // Initialize state
 * initTreeState({
 *   initialState: { user: { name: "John" } },
 *   middleware: [createLoggingMiddleware()]
 * });
 *
 * // Set and get values
 * set("user/name", "Jane");
 * const name = get("user/name");
 *
 * // Subscribe to changes
 * subscribe("user/name", (value) => {
 *   console.log("Name changed:", value);
 * });
 * ```
 */
/**
 * Initialize the tree state system with configuration.
 * This should be called before using any other tree state functions.
 *
 * @param config - Configuration options for the tree state system
 * @param config.initialState - Initial state object
 * @param config.middleware - Array of middleware functions to apply
 *
 * @example
 * ```typescript
 * initTreeState({
 *   initialState: { user: { name: "" } },
 *   middleware: [createLoggingMiddleware()]
 * });
 * ```
 */
export declare function initTreeState(config?: StoreConfig<any>): void;
/**
 * Register a middleware function for the tree state system.
 * Middleware functions can transform or block state updates.
 *
 * @param fn - The middleware function to register
 *
 * @example
 * ```typescript
 * useTreeMiddleware((path, nextValue, prevValue) => {
 *   console.log(`${path} changed from`, prevValue, "to", nextValue);
 *   return nextValue;
 * });
 * ```
 */
export declare function useTreeMiddleware(fn: Middleware<any>): void;
/**
 * Get the value at a specific path in the state tree.
 * Returns undefined if the path doesn't exist.
 *
 * @param path - The path to get the value from (e.g., "user/name")
 * @returns The value at the specified path
 *
 * @example
 * ```typescript
 * const name = get("user/name");
 * const age = get("user/profile/age");
 * ```
 */
export declare function get(path: string): any;
/**
 * Set a value at a specific path in the state tree.
 * Runs all middleware functions before applying the update.
 *
 * @param path - The path to set the value at (e.g., "user/name")
 * @param value - The new value to set
 * @returns A promise that resolves to true if the update was successful, false if blocked by middleware
 *
 * @example
 * ```typescript
 * await set("user/name", "John");
 * await set("user/profile/age", 30);
 * ```
 */
export declare function set(path: string, value: any): Promise<boolean>;
/**
 * Subscribe to changes at a specific path in the state tree.
 * The callback will be called whenever the value at the path or any of its children changes.
 *
 * @param path - The path to subscribe to (e.g., "user/name")
 * @param callback - Function to call when the value changes
 * @returns A function to unsubscribe from changes
 *
 * @example
 * ```typescript
 * const unsubscribe = subscribe("user/name", (value) => {
 *   console.log("Name changed:", value);
 * });
 *
 * // Later, to unsubscribe:
 * unsubscribe();
 * ```
 */
export declare function subscribe(path: string, callback: (value: any) => void): () => void;
/**
 * Add a middleware function to the state system.
 * Middleware functions are called in the order they are added.
 *
 * @param m - The middleware function to add
 *
 * @example
 * ```typescript
 * addMiddleware(createLoggingMiddleware());
 * ```
 */
export declare function addMiddleware(m: Middleware<any>): void;
/**
 * Remove a middleware function from the state system.
 *
 * @param m - The middleware function to remove
 *
 * @example
 * ```typescript
 * const middleware = createLoggingMiddleware();
 * addMiddleware(middleware);
 * // Later:
 * removeMiddleware(middleware);
 * ```
 */
export declare function removeMiddleware(m: Middleware<any>): void;
/**
 * Clear all middleware functions from the state system.
 *
 * @example
 * ```typescript
 * clearMiddleware();
 * ```
 */
export declare function clearMiddleware(): void;
/**
 * Get all currently registered middleware functions.
 *
 * @returns Array of registered middleware functions
 *
 * @example
 * ```typescript
 * const middleware = getMiddleware();
 * console.log("Registered middleware:", middleware.length);
 * ```
 */
export declare function getMiddleware(): Middleware<any>[];
