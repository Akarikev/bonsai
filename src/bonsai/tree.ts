// src/tree.ts
import type { Middleware, StoreConfig } from "./types";
import { addLog } from "./devlog";

type Listener = (newValue: any) => void;

// ✅ Middleware can now modify or cancel the update by returning a new value or `false`
// type Middleware<T> = (path: string, newValue: T, prevValue: T) => any | false;

// Global state store
let state: Record<string, any> = {};
const listeners: Record<string, Listener[]> = {};

// ✅ Middleware registry
let middleware: Middleware<any>[] = [];

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
export function initTreeState(config: StoreConfig<any> = {}) {
  if (config.initialState) {
    state = config.initialState;
  }
  if (config.middleware) {
    middleware = config.middleware;
  }
}

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
export function useTreeMiddleware(fn: Middleware<any>) {
  middleware.push(fn);
  console.log("[Bonsai:tree] MIDDLEWARE REGISTERED");
}

/**
 * Get the value at a specific path in the state tree.
 * Internal function used by other tree state functions.
 *
 * @param path - The path to get the value from (e.g., "user/name")
 * @returns The value at the specified path
 */
function getAtPath(path: string): any {
  const value = path.split("/").reduce((acc, key) => acc?.[key], state);
  return value;
}

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
export function get(path: string): any {
  if (!path) return state;

  const parts = path.split("/").filter(Boolean);
  let current = state;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
}

// ✅ Set value at path and run middleware
function setAtPath(path: string, value: any): void {
  const prevValue = getAtPath(path);

  // ✅ Run middleware in order; allow transforms or blocking
  let nextValue = value;
  for (const mw of middleware) {
    try {
      const result = mw(path, nextValue, prevValue);
      if (result === false) {
        console.log(`[Bonsai:tree] Middleware blocked update on ${path}`);
        return;
      }
      if (result !== undefined) {
        nextValue = result;
      }
    } catch (e) {
      console.warn(`[Bonsai:tree] middleware error on ${path}:`, e);
    }
  }

  // ✅ Proceed to update the state tree
  const keys = path.split("/");
  let target = state;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!target[keys[i]]) target[keys[i]] = {};
    target = target[keys[i]];
  }

  target[keys[keys.length - 1]] = nextValue;
  console.log(`[Bonsai:tree] SET ${path}`, nextValue);

  notify(path);
}

// Notify listeners that are subscribed to this path or any parent path
function notify(path: string) {
  for (const key in listeners) {
    if (path.startsWith(key)) {
      const current = getAtPath(key);
      listeners[key].forEach((fn) => fn(current));
    }
  }
}

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
export async function set(path: string, value: any): Promise<boolean> {
  const prevValue = get(path);

  // Run middleware chain
  let nextValue = value;
  for (const m of middleware) {
    try {
      const result = await m(path, nextValue, prevValue);
      if (result === false) {
        if (middleware.length > 0) {
          addLog(`❌ Update blocked by middleware at path: ${path}`);
        }
        return false;
      }
      nextValue = result;
    } catch (error) {
      console.error(
        `[Bonsai:Middleware] Error in middleware for path "${path}":`,
        error
      );
      return false;
    }
  }

  // Update state
  if (!path) {
    state = nextValue;
  } else {
    const parts = path.split("/").filter(Boolean);
    let current = state;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = nextValue;
  }

  // Notify subscribers
  subscribers.forEach((callback) => callback(path));

  return true;
}

// Subscriber management
const subscribers = new Set<(path: string) => void>();

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
export function subscribe(
  path: string,
  callback: (value: any) => void
): () => void {
  const handler = (changedPath: string) => {
    if (!path || changedPath.startsWith(path)) {
      callback(get(path));
    }
  };

  subscribers.add(handler);
  return () => subscribers.delete(handler);
}

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
export function addMiddleware(m: Middleware<any>) {
  middleware.push(m);
}

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
export function removeMiddleware(m: Middleware<any>) {
  const index = middleware.indexOf(m);
  if (index !== -1) {
    middleware.splice(index, 1);
  }
}

/**
 * Clear all middleware functions from the state system.
 *
 * @example
 * ```typescript
 * clearMiddleware();
 * ```
 */
export function clearMiddleware() {
  middleware = [];
}

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
export function getMiddleware(): Middleware<any>[] {
  return [...middleware];
}
