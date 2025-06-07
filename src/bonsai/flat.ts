/**
 * Flat state management system for Bonsai.
 * Provides a simple key-value store with middleware support and React integration.
 * Best suited for simple, non-nested state structures.
 *
 * @example
 * ```typescript
 * // Set and get state
 * setState({ count: 0 });
 * const state = getState();
 *
 * // Use in React components
 * function Counter() {
 *   const count = useBonsai(state => state.count);
 *   return <button onClick={() => setState({ count: count + 1 })}>
 *     Count: {count}
 *   </button>;
 * }
 * ```
 */

import { useSyncExternalStore } from "react";

type Listener = () => void;
type State = Record<string, any>;
type Middleware = (nextState: State, prevState: State) => State | false;

let state: State = {};
const listeners = new Set<Listener>();
const middlewares: Middleware[] = [];

/**
 * Get the current state object.
 *
 * @returns The current state object
 *
 * @example
 * ```typescript
 * const state = getState();
 * console.log("Current state:", state);
 * ```
 */
export function getState(): State {
  console.log("[Bonsai:Flat] GET", state);
  return state;
}

/**
 * Update the state with new values.
 * Runs all middleware functions before applying the update.
 *
 * @param partial - Partial state object containing the updates
 *
 * @example
 * ```typescript
 * setState({ count: 1, name: "John" });
 * ```
 */
export function setState(partial: Partial<State>): void {
  const next = { ...state, ...partial };

  let modifiedState: State | false = next;

  for (const mw of middlewares) {
    const result = mw(modifiedState, state);
    if (result === false) {
      console.log("[Bonsai:Flat] Middleware blocked update:", modifiedState);
      return;
    }
    modifiedState = result;
  }

  state = modifiedState;
  listeners.forEach((l) => l());
  console.log("[Bonsai:Flat] SET", state);
}

/**
 * React hook to subscribe to state changes.
 * Uses React's useSyncExternalStore for optimal performance.
 *
 * @param selector - Function to select the desired state slice
 * @returns The selected state value
 *
 * @example
 * ```typescript
 * function Counter() {
 *   const count = useBonsai(state => state.count);
 *   return <div>Count: {count}</div>;
 * }
 * ```
 */
export function useBonsai<T = any>(
  selector: (state: State) => T = (s) => s as T
): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      console.log("[Bonsai:Flat] SUBSCRIBE", cb);
      return () => {
        listeners.delete(cb);
        console.log("[Bonsai:Flat] UNSUBSCRIBE", cb);
      };
    },
    () => selector(state),
    () => selector(state)
  );
}

/**
 * Alias for useBonsai with a more descriptive name.
 * Use this when you want to be explicit about using a selector.
 *
 * @param selector - Function to select the desired state slice
 * @returns The selected state value
 *
 * @example
 * ```typescript
 * function UserProfile() {
 *   const name = useFlatSelector(state => state.user.name);
 *   return <div>Name: {name}</div>;
 * }
 * ```
 */
export function useFlatSelector<T = any>(selector: (state: State) => T): T {
  return useBonsai(selector);
}

/**
 * Add a middleware function to the flat state system.
 * Middleware functions can transform or block state updates.
 *
 * @param middleware - The middleware function to add
 *
 * @example
 * ```typescript
 * addFlatMiddleware((next, prev) => {
 *   console.log("State changing from", prev, "to", next);
 *   return next;
 * });
 * ```
 */
export function addFlatMiddleware(middleware: Middleware) {
  console.log("[Bonsai:Flat] MIDDLEWARE REGISTERED");
  middlewares.push(middleware);
}
