# Bonsai State Management Examples

This document provides a comprehensive guide on how to use Bonsai State Management in various scenarios.

## Use Cases

### 1. Tree State Management (recommended with createStore)

Tree state is ideal for managing nested data structures. Here's how you can use it:

```tsx
import { createStore } from "@bonsai-ts/state";

export const store = createStore({
  user: { name: "John", preferences: { theme: "light", notifications: true } },
});

function UserProfile() {
  const name = store.use<string>("user/name");
  const theme = store.use<string>("user/preferences/theme");

  return (
    <div>
      <p>Name: {name}</p>
      <p>Theme: {theme}</p>
      <button
        onClick={() =>
          store.set(
            "user/preferences/theme",
            theme === "light" ? "dark" : "light"
          )
        }
      >
        Toggle Theme
      </button>
    </div>
  );
}
```

### 2. Flat State Management

Flat state is suitable for simple key-value pairs. Here's an example:

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

### 3. Scoped State Management

Scoped state is useful for component-specific state. Here's how to use it:

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

### 4. Middleware Usage (with createStore)

Middleware can be used to add custom logic to state updates. Here's an example with validation and logging:

```tsx
import {
  createStore,
  createValidationMiddleware,
  createLoggingMiddleware,
} from "@bonsai-ts/state";

const userValidator = createValidationMiddleware<{ name: string; age: number }>(
  (path, nextValue) => {
    if (!nextValue.name || nextValue.name.length < 2)
      return "Name must be at least 2 characters long";
    if (nextValue.age < 18) return "User must be at least 18 years old";
    return true;
  }
);

const logger = createLoggingMiddleware<{ name: string; age: number }>({
  logPath: true,
  logValue: true,
  logPrevValue: true,
});

export const store = createStore(
  { user: { name: "", age: 0 } },
  { middleware: [userValidator, logger], devtools: true }
);
```

## Benchmarks

Benchmarks are currently being developed to provide performance metrics for Bonsai State Management. Stay tuned for updates!

## Bundle Size

The current bundle size for Bonsai State Management is approximately 7KB gzipped. This includes both ESM and UMD formats.

- ESM: 29.89 KB (7.12 KB gzipped)
- UMD: 16.43 KB (5.88 KB gzipped)

For more detailed information, refer to the [README.md](README.md).
