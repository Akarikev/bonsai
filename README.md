# Bonsai State Management 🌳

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

### Tree State

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

### DevTools

```tsx
import { DevPanel } from "@bonsai-ts/state";

function App() {
  return (
    <div>
      <Counter />
      <UserProfile />
      {/* Add DevPanel to debug state changes */}
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

![DevPanel Preview](docs/devpanel-preview.png)

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

## Comparison with Other Libraries

| Feature      | Bonsai | Redux | Zustand | Jotai |
| ------------ | ------ | ----- | ------- | ----- |
| Bundle Size  | ~7KB   | ~8KB  | ~1KB    | ~3KB  |
| Tree State   | ✅     | ❌    | ❌      | ✅    |
| Flat State   | ✅     | ✅    | ✅      | ❌    |
| Scoped State | ✅     | ❌    | ❌      | ✅    |
| Middleware   | ✅     | ✅    | ❌      | ❌    |
| DevTools     | ✅     | ✅    | ❌      | ❌    |
| TypeScript   | ✅     | ✅    | ✅      | ✅    |
| Zero Config  | ✅     | ❌    | ✅      | ✅    |

> **Note**: Bundle sizes are gzipped. Bonsai's actual sizes:
>
> - ESM: 29.89 KB (7.12 KB gzipped)
> - UMD: 16.43 KB (5.88 KB gzipped)

## Troubleshooting

### Common Issues

1. **State Updates Not Reflecting**

   ```tsx
   // ❌ Wrong
   set("user/name", "John");
   console.log(get("user/name")); // Might not show updated value

   // ✅ Correct
   set("user/name", "John", () => {
     console.log(get("user/name")); // Will show updated value
   });
   ```

2. **Middleware Not Working**

   ```tsx
   // ❌ Wrong
   initTreeState({
     initialState: { count: 0 },
     middleware: [myMiddleware], // Missing array
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

# Generate documentation
bun run docs
```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## Support

- [GitHub Issues](https://github.com/Akarikev/bonsai/issues)
- [Documentation](docs/BONSAI.MD)
- [Examples](docs/USEBONSAI.MD)

## License

MIT © Prince Elorm(Akarikev)
