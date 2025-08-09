/**
 * Store creation utility for Bonsai.
 * Creates an isolated state store with its own state, middleware, and subscriptions.
 * Useful for component-specific state or feature-based state isolation.
 *
 * @example
 * ```typescript
 * // Create a store for user state
 * const userStore = createBonsaiStore<{ name: string; age: number }>();
 *
 * // Use in a component
 * function UserProfile() {
 *   const name = userStore.use(state => state.name);
 *   return <div>Name: {name}</div>;
 * }
 * ```
 */

import { useSyncExternalStore } from "react";
type BonsaiPath = (string | number)[];

type Listener = () => void;

/**
 * Creates a new isolated state store.
 * Each store has its own state, middleware, and subscription system.
 *
 * @returns An object with methods to interact with the store
 *
 * @example
 * ```typescript
 * // Create a store with TypeScript types
 * interface TodoState {
 *   todos: string[];
 *   filter: 'all' | 'active' | 'completed';
 * }
 *
 * const todoStore = createBonsaiStore<TodoState>();
 *
 * // Initialize state
 * todoStore.set({ todos: [], filter: 'all' });
 *
 * // Use in components
 * function TodoList() {
 *   const todos = todoStore.use(state => state.todos);
 *   return <ul>{todos.map(todo => <li>{todo}</li>)}</ul>;
 * }
 * ```
 */
export function createBonsaiStore<State extends Record<string, any>>() {
  let state: State = {} as State;
  const listeners = new Set<Listener>();

  function getState(): State {
    return state;
  }

  function setState(partial: Partial<State>) {
    state = { ...state, ...partial };
    listeners.forEach((l) => l());
  }

  function useStore<T>(
    selector: (state: State) => T = (s) => s as unknown as T
  ): T {
    return useSyncExternalStore(
      (cb) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
      },
      () => selector(state),
      () => selector(state)
    );
  }

  return {
    get: getState,
    set: setState,
    use: useStore,
  };
}

// --- Tree-style store factory with options (devtools + middleware) ---
import {
  initTreeState,
  get as treeGet,
  set as treeSet,
  subscribe as treeSubscribe,
  addMiddleware as addTreeMiddleware,
} from "./tree";
import { useTreeBonsai } from "./usetreebonsai";
import type { Middleware } from "./types";

type KoaStyleMiddleware = (
  next: (path: string, value: any) => any
) => (path: string, value: any, prevValue?: any) => any;

function adaptMiddleware(
  fn: Middleware<any> | KoaStyleMiddleware
): Middleware<any> {
  // Heuristic: Koa-style middlewares are functions of arity 1 returning a function
  if (typeof fn === "function" && fn.length === 1) {
    const inner = (fn as KoaStyleMiddleware)((_path, value) => value);
    return (path, nextValue, prevValue) => {
      const result = inner(path, nextValue, prevValue);
      return result === undefined ? nextValue : result;
    };
  }
  return fn as Middleware<any>;
}

export interface CreateStoreOptions {
  devtools?: boolean;
  middleware?: Array<Middleware<any> | KoaStyleMiddleware>;
}

export function createStore<RootState extends Record<string, any>>(
  initialState: RootState,
  options: CreateStoreOptions = {}
) {
  // Initialize the global tree state with provided initial state and middleware
  initTreeState({
    initialState,
    middleware: (options.middleware || []).map(adaptMiddleware),
  });

  // Optionally auto-mount DevTools panel
  if (options.devtools) {
    // Lazy import to avoid pulling devtools into production bundles unless enabled
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import("../devtools/autoMount")
      .then((m) => {
        if (typeof window !== "undefined") {
          m.mountDevtools();
        }
      })
      .catch(() => {
        // ignore mounting errors in non-browser environments
      });
  }

  return {
    get: (path: string) => treeGet(path),
    set: (path: string, value: any) => treeSet(path, value),
    subscribe: (path: string, cb: (value: any) => void) =>
      treeSubscribe(path, cb),
    use: <T = any>(path: string) => useTreeBonsai<T>(path),
    addMiddleware: (mw: Middleware<any> | KoaStyleMiddleware) =>
      addTreeMiddleware(adaptMiddleware(mw)),
  } as const;
}
