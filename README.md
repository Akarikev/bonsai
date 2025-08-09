# Bonsai State Management 🌳

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-7KB%20gzipped-green)](https://img.shields.io/badge/Bundle%20Size-7KB%20gzipped-green)

A flexible and lightweight state management library for React applications, featuring tree and flat state support, middleware system, and powerful dev tools.

## Why Bonsai? 🌱

Bonsai offers a unique approach to state management:

- **Simple Yet Powerful**: Easy to learn, but powerful enough for complex applications
- **Type-Safe by Default**: Full TypeScript support with excellent type inference
- **Flexible Architecture**: Choose between tree state, flat state, or scoped state
- **Built-in DevTools**: Debug and inspect state changes in real-time
- **Middleware System**: Extend functionality with custom middleware
- **Zero Dependencies**: Lightweight and fast, with no external dependencies
- **React Native Ready**: Works seamlessly with both web and mobile React applications

## Features

- 🌳 **Tree State**: Manage nested state with path-based access
- 🌿 **Flat State**: Simple key-value state management
- 🪴 **Scoped State**: Isolated state stores for components
- 🔌 **Middleware**: Transform or block state updates
- 🛠️ **DevTools**: Visual debugging and state inspection
- 📦 **TypeScript**: Full type safety and autocompletion

## What's new in this release

- **createStore API**: one-call setup for tree state with options `{ devtools, middleware }`.
- **Auto-mounted DevTools**: enable with `devtools: true` (no component needed).
- **Modern DevTools UI**: tabs (State, Inspector, Logs, Settings), draggable, resizable, search, copy buttons with feedback, and a toggle hotkey.
- **Hotkey**: Ctrl+Shift+B toggles the DevTools panel.
- **Koa-style middleware adapter**: pass `(next) => (path, value, prev) => next(path, value)` directly.

> Note: The classic API (`initTreeState`, `useTreeBonsai`, `set`, `get`, `subscribe`) is still available and supported. New projects are encouraged to use `createStore` for simpler setup and optional DevTools auto-mounting.

## Prerequisites

- React >= 18.2.0
- TypeScript >= 5.0.0 (recommended)

## Installation

```bash
# Using npm
npm install @bonsai-ts/state

# Using yarn
yarn add @bonsai-ts/state

# Using pnpm
pnpm add @bonsai-ts/state

# Using bun
bun add @bonsai-ts/state
```

## Quick Start

### Recommended: createStore

```tsx
import { createStore } from "@bonsai-ts/state";

// Initialize once with options (auto-mounts DevTools in dev when enabled)
export const appStore = createStore(
  {
    count: 0,
    user: { name: "elorm", isActive: true },
  },
  { devtools: true }
);

// Use in components
function Counter() {
  const count = appStore.use<number>("count") || 0;
  return (
    <button onClick={() => appStore.set("count", count + 1)}>
      Increment ({count})
    </button>
  );
}
```

### Tree State (classic API)

```tsx
import { initTreeState, useTreeBonsai, set } from "@bonsai-ts/state";

// Initialize tree state
initTreeState({
  initialState: {
    count: 0,
    user: {
      name: "elorm",
      isActive: true,
    },
  },
});

// Use in components
function Counter() {
  const count = useTreeBonsai("count");
  const name = useTreeBonsai("user/name");

  return (
    <div>
      <p>Count: {count}</p>
      <p>Name: {name}</p>
      <button onClick={() => set("count", count + 1)}>Increment</button>
    </div>
  );
}
```

### Flat State

```tsx
import { useBonsai, setState } from "@bonsai-ts/state";

function UserProfile() {
  const name = useBonsai((state) => state.name || "");
  const isActive = useBonsai((state) => state.isActive || false);

  return (
    <div>
      <p>Name: {name}</p>
      <button onClick={() => setState({ isActive: !isActive })}>
        Toggle Status
      </button>
    </div>
  );
}
```

### DevTools (Optional)

There are two ways to use DevTools:

- Recommended: enable auto-mount via `createStore(..., { devtools: true })`.
- Manual: render the component yourself if you want full control.

Manual render example:

```tsx
import { DevPanel } from "@bonsai-ts/state/devtools";

function App() {
  return (
    <div>
      <Counter />
      <UserProfile />
      <DevPanel />
    </div>
  );
}
```

The DevPanel provides:

- 🌳 **State Tree View**: Visualize your entire state tree
- 📝 **Log Viewer**: Track all state changes in real-time
- 🔍 **State Inspector**: Inspect and modify state values
- ⚡ **Performance Monitor**: Track re-renders and updates
- ✨ **Enhanced Object/Array Visualization**: Structured, collapsible, and editable views for complex data types.
- ⌨️ **Hotkey**: Ctrl+Shift+B to toggle visibility.
- 🧭 **Draggable & Resizable**: drag the header, resize from the bottom-right handle.
- 📋 **Copy with feedback**: copy paths or JSON values with visual confirmation.

### DevTools Screenshots

![DevPanel Preview (Updated UI)](docs/devpanel-preview.gif)

> **Note**: The DevPanel is only included in development builds and is automatically excluded from production builds. You only need to import and use it if you want to visualize and debug your application's state.

## More Examples

### Tree State with Middleware

```tsx
import {
  initTreeState,
  useTreeBonsai,
  set,
  createLoggingMiddleware,
  createValidationMiddleware,
} from "@bonsai-ts/state";

// Initialize with middleware
initTreeState({
  initialState: {
    user: {
      name: "",
      preferences: {
        theme: "light",
        notifications: true,
      },
    },
  },
  middleware: [
    createLoggingMiddleware({ logPath: true, logValue: true }),
    createValidationMiddleware((path, value) => {
      if (
        path === "user/name" &&
        typeof value === "string" &&
        value.length < 2
      ) {
        return "Name must be at least 2 characters long";
      }
      return true;
    }),
  ],
});

function UserProfile() {
  const name = useTreeBonsai("user/name");
  const theme = useTreeBonsai("user/preferences/theme");

  return (
    <div>
      <input value={name} onChange={(e) => set("user/name", e.target.value)} />
      <button
        onClick={() =>
          set("user/preferences/theme", theme === "light" ? "dark" : "light")
        }
      >
        Toggle Theme
      </button>
    </div>
  );
}
```

### Flat State

```tsx
import { useBonsai, setState } from "@bonsai-ts/state";

function UserProfile() {
  const name = useBonsai((state) => state.name || "");
  const notifications = useBonsai((state) => state.notifications || false);

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setState({ name: e.target.value })}
      />
      <label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setState({ notifications: e.target.checked })}
        />
        Enable Notifications
      </label>
    </div>
  );
}
```

### Scoped State

```tsx
import { createBonsaiStore } from "@bonsai-ts/state";

// Create a scoped store
const todoStatsStore = createBonsaiStore<{
  totalCompleted: number;
  totalPending: number;
}>();

function TodoStats() {
  const stats = todoStatsStore.use((state) => state);

  return (
    <div>
      <p>Total Completed: {stats.totalCompleted || 0}</p>
      <p>Total Pending: {stats.totalPending || 0}</p>
    </div>
  );
}

// Update stats from tree state
subscribe("todos", (todos) => {
  if (!todos) return;

  const totalCompleted = todos.filter((todo) => todo.completed).length;
  const totalPending = todos.length - totalCompleted;

  todoStatsStore.set({ totalCompleted, totalPending });
});
```

### Tree Store with DevTools and Middleware (createStore)

```tsx
import { createStore, createLoggingMiddleware } from "@bonsai-ts/state";

export const counterStore = createStore(
  { count: 0 },
  {
    devtools: true, // auto-mounts the DevTools floating panel
    middleware: [
      createLoggingMiddleware({ logPath: true, logValue: true }),
      // Or Koa-style middleware adapter
      (next) => (path, value, prev) => {
        console.log(`State change at ${path}:`, { prev, value });
        return next(path, value);
      },
    ],
  }
);

// Usage in components
function Counter() {
  const count = counterStore.use<number>("count");
  return (
    <button onClick={() => counterStore.set("count", (count || 0) + 1)}>
      {count || 0}
    </button>
  );
}
```

### createStore API

- `createStore(initialState, options)` returns an object with:
  - `get(path)`: read a value at a path
  - `set(path, value)`: async update; resolves to `true | false` if blocked by middleware
  - `subscribe(path, cb)`: listen for changes under a path
  - `use<T>(path)`: React hook to read and subscribe to a path
  - `addMiddleware(mw)`: add middleware after initialization
- `options`:
  - `devtools?: boolean` – auto-mount floating DevTools panel when `true`
  - `middleware?: (Middleware | (next) => (path, value, prev) => any)[]` – chain of middleware; Koa-style functions are adapted automatically

Tips:

- `set` is async; await if you need to read immediately after updating.
- Use specific paths in `use(path)` to minimize re-renders.

## Migration: initTreeState ➜ createStore

If you previously used `initTreeState`, migrating to `createStore` takes a few steps:

1. Initialize once with `createStore` instead of `initTreeState`:
   - Before:
     ```ts
     initTreeState({ initialState, middleware: [m1, m2] });
     ```
   - After:
     ```ts
     export const appStore = createStore(initialState, {
       middleware: [m1, m2],
       devtools: true,
     });
     ```
2. Replace direct tree APIs in components:
   - `useTreeBonsai(path)` ➜ `appStore.use(path)`
   - `set(path, value)` ➜ `appStore.set(path, value)` (still async)
   - `subscribe(path, cb)` ➜ `appStore.subscribe(path, cb)`
   - Optional: `appStore.addMiddleware(mw)` to add later
3. DevTools:
   - Before: render `<DevPanel />` manually
   - After: set `devtools: true` to auto-mount; or keep manual component render if preferred
4. Middleware:
   - Existing middleware works as-is; you can also pass Koa-style `(next) => (path, value, prev)` functions
5. Type-safety & paths:
   - Continue to use forward-slash paths like "user/name"
6. Async behavior reminder:
   - `set` is async; `await appStore.set(path, value)` when you need the updated value immediately

Minimal example conversion:

```tsx
// Before
initTreeState({ initialState: { count: 0 } });
function Counter() {
  const count = useTreeBonsai("count") || 0;
  return <button onClick={() => set("count", count + 1)}>{count}</button>;
}

// After
export const store = createStore({ count: 0 }, { devtools: true });
function Counter() {
  const count = store.use<number>("count") || 0;
  return <button onClick={() => store.set("count", count + 1)}>{count}</button>;
}
```

## FAQ

- **How do I enable DevTools?** Use `createStore(..., { devtools: true })`. Or render `<DevPanel />` manually from `@bonsai-ts/state/devtools`.
- **How do I disable DevTools in production?** Auto-mount is only intended for development; avoid passing `devtools: true` in production builds. The component is tree-shakeable when not imported.
- **Does this work with Next.js/SSR?** Yes. The store APIs are isomorphic; the DevTools auto-mount only runs in the browser (checks `document`).
- **Is `set` async now?** Yes. Await `set` if you need to read the updated value immediately after.
- **Can I add middleware after creating the store?** Yes: `store.addMiddleware(mw)`.
- **React Native?** Supported. DevTools auto-mount is web-only; for RN, omit `devtools: true` or build a separate debug screen using the store APIs.
- **Hotkey conflicts?** The DevTools toggle uses Ctrl+Shift+B. You can collapse via the close button if there’s a conflict.

## Troubleshooting

### Common Issues

1. **State Updates Not Reflecting**

   ```tsx
   // ❌ Wrong
   set("user/name", "John");
   console.log(get("user/name")); // Might not show updated value (set is async)

   // ✅ Correct
   await set("user/name", "John");
   console.log(get("user/name")); // Will show updated value
   ```

2. **Middleware Not Working**

   ```tsx
   // ❌ Wrong
   initTreeState({
     initialState: { count: 0 },
     middleware: myMiddleware, // Should be an array
   });

   // ✅ Correct
   initTreeState({
     initialState: { count: 0 },
     middleware: [myMiddleware],
   });
   ```

3. **Type Errors with Paths**

   ```tsx
   // ❌ Wrong
   useTreeBonsai("user.name"); // Using dot notation

   // ✅ Correct
   useTreeBonsai("user/name"); // Using forward slash
   ```

### Performance Tips

1. **Use Scoped State for Local State**

   ```tsx
   // For component-specific state
   const localStore = createBonsaiStore({ count: 0 });
   const count = localStore.use((state) => state.count);
   ```

2. **Optimize Re-renders**

   ```tsx
   // Use specific paths instead of entire objects
   const name = useTreeBonsai("user/name"); // ✅
   const user = useTreeBonsai("user"); // ❌
   ```

3. **Batch Updates**
   ```tsx
   // Multiple updates in one render
   set("user", {
     name: "John",
     age: 30,
   });
   ```

## Middleware Examples

### Basic Middleware Composition

```tsx
import {
  initTreeState,
  createValidationMiddleware,
  createLoggingMiddleware,
  createPersistenceMiddleware,
} from "@bonsai-ts/state";

// Validation middleware
const positiveNumberValidator = createValidationMiddleware<number>(
  (path, nextValue) => {
    if (typeof nextValue !== "number") {
      return "Value must be a number";
    }
    if (nextValue < 0) {
      return "Value must be positive";
    }
    return true;
  }
);

// Logging middleware
const logger = createLoggingMiddleware<number>({
  logPath: true,
  logValue: true,
  logPrevValue: true,
});

// Persistence middleware
const persister = createPersistenceMiddleware<number>("counter");

// Initialize with middleware chain
initTreeState({
  initialState: { counter: 0 },
  middleware: [positiveNumberValidator, logger, persister],
});
```

### Async Operations with Debouncing

```tsx
import {
  initTreeState,
  createAsyncMiddleware,
  createDebounceMiddleware,
} from "@bonsai-ts/state";

// Async middleware for API calls
const apiMiddleware = createAsyncMiddleware<number>(async (path, nextValue) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`[API] Updating ${path} to ${nextValue}`);
  return nextValue;
});

// Debounce middleware
const debouncer = createDebounceMiddleware<number>(500);

initTreeState({
  initialState: { searchQuery: "" },
  middleware: [debouncer, apiMiddleware],
});
```

### Rate Limiting and Time Windows

```tsx
import {
  initTreeState,
  createThrottleMiddleware,
  createTimeWindowMiddleware,
} from "@bonsai-ts/state";

// Throttle middleware (1 update per second)
const throttler = createThrottleMiddleware<number>(1);

// Time window middleware (business hours only)
const timeWindow = createTimeWindowMiddleware<number>([
  9, 10, 11, 12, 13, 14, 15, 16, 17,
]);

initTreeState({
  initialState: { apiCalls: 0 },
  middleware: [throttler, timeWindow],
});
```

### Complex Validation

```tsx
import {
  initTreeState,
  createValidationMiddleware,
  createAsyncMiddleware,
} from "@bonsai-ts/state";

// User data validation
const userValidator = createValidationMiddleware<{
  name: string;
  age: number;
  email: string;
}>((path, nextValue) => {
  if (!nextValue.name || nextValue.name.length < 2) {
    return "Name must be at least 2 characters long";
  }
  if (nextValue.age < 18) {
    return "User must be at least 18 years old";
  }
  if (!nextValue.email.includes("@")) {
    return "Invalid email address";
  }
  return true;
});

// Async validation
const asyncValidator = createAsyncMiddleware<{
  name: string;
  age: number;
  email: string;
}>(async (path, nextValue) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`[Validation] Checking user data for ${nextValue.name}`);
  return nextValue;
});

initTreeState({
  initialState: {
    user: {
      name: "",
      age: 0,
      email: "",
    },
  },
  middleware: [userValidator, asyncValidator],
});
```

### Form Handling

```tsx
import {
  initTreeState,
  createDebounceMiddleware,
  createPersistenceMiddleware,
  createLoggingMiddleware,
} from "@bonsai-ts/state";

// Form state with debouncing, persistence, and logging
initTreeState({
  initialState: {
    form: {
      username: "",
      password: "",
      email: "",
    },
  },
  middleware: [
    createDebounceMiddleware<{
      username: string;
      password: string;
      email: string;
    }>(300),
    createLoggingMiddleware<{
      username: string;
      password: string;
      email: string;
    }>({
      logPath: true,
      logValue: false, // Don't log sensitive data
      logPrevValue: false,
    }),
    createPersistenceMiddleware<{
      username: string;
      password: string;
      email: string;
    }>("formState"),
  ],
});
```

## Documentation

For detailed documentation, check out our docs:

- [Core Documentation](docs/BONSAI.MD) - Learn about Bonsai's core concepts and architecture
- [Usage Guide](docs/USEBONSAI.MD) - Comprehensive guide with examples and best practices

### Key Concepts

1. **Tree State**

   - Path-based state access (e.g., "user/profile/name")
   - Nested state management
   - Middleware support
   - Type-safe updates

2. **Flat State**

   - Simple key-value store
   - Selector-based access
   - Direct state updates
   - Performance optimized

3. **Scoped State**

   - Component-specific state
   - Isolated state stores
   - Type-safe access
   - Automatic cleanup

4. **Middleware**

   - Validation
   - Logging
   - Debouncing
   - Persistence
   - Custom middleware support

5. **DevTools**
   - State visualization
   - Real-time updates
   - Path inspection
   - Log viewer
   - State modification

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build library
bun run build

# Run tests
bun test

# Run bundle analysis
bun run analyze

# Run benchmarks
bun run benchmark

# Generate documentation
bun run docs
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

- [GitHub Issues](https://github.com/Akarikev/bonsai/issues)
- [Documentation](docs/BONSAI.MD)
- [Examples](docs/USEBONSAI.MD)

## Changelog

See `CHANGELOG.md` for release notes.

## Support

- [GitHub Issues](https://github.com/Akarikev/bonsai/issues)
- [Documentation](docs/BONSAI.MD)
- [Examples](docs/USEBONSAI.MD)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

- MIT © Prince Elorm(Akarikev)
