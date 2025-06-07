/**
 * React hook for subscribing to tree state changes.
 * Provides a simple way to access and subscribe to values in the tree state system.
 * Uses React's useSyncExternalStore for optimal performance.
 *
 * @example
 * ```typescript
 * function UserProfile() {
 *   const name = useTreeBonsai("user/name");
 *   const age = useTreeBonsai("user/age");
 *
 *   return (
 *     <div>
 *       <p>Name: {name}</p>
 *       <p>Age: {age}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useSyncExternalStore } from "react";
import { subscribe, get } from "./tree"; // import your tree subscription & getter

/**
 * React hook to subscribe to a specific path in the tree state.
 * Re-renders only when the value at that path changes.
 *
 * @param path string representing nested state path, e.g. "user/name"
 * @returns the current value at that path
 *
 * @example
 * ```typescript
 * // Subscribe to a single value
 * const name = useTreeBonsai("user/name");
 *
 * // Subscribe to a nested object
 * const profile = useTreeBonsai("user/profile");
 *
 * // Subscribe to an array
 * const todos = useTreeBonsai("todos");
 * ```
 */
export function useTreeBonsai<T = any>(path: string): T {
  return useSyncExternalStore(
    (callback) => {
      // Subscribe to changes at this path
      const unsubscribe = subscribe(path, callback);
      return unsubscribe;
    },
    () => get(path), // get current state at path for render
    () => get(path) // get snapshot for server rendering fallback
  );
}
