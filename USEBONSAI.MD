# Using Bonsai State Management

Bonsai is a flexible state management system that supports both flat and tree-based state structures, with a powerful middleware architecture. This guide covers all aspects of using Bonsai in your application.

## Table of Contents

- [Quick Start](#quick-start)
- [State Management Patterns](#state-management-patterns)
  - [Tree State](#tree-state)
  - [Flat State](#flat-state)
  - [Scoped State](#scoped-state)
- [Middleware System](#middleware-system)
- [React Integration](#react-integration)
- [Best Practices](#best-practices)
- [DevTools Integration](#devtools-integration)
- [Path Utilities](#path-utilities)
- [Advanced Middleware Composition](#advanced-middleware-composition)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)

## Quick Start

```typescript
import { initTreeState, set, get } from "./bonsai/tree";
import { createLoggingMiddleware } from "./bonsai/middleware";

// Initialize with middleware
initTreeState({
  initialState: { user: { name: "", age: 0 } },
  middleware: [createLoggingMiddleware()],
});

// Use the state
set("user/name", "John");
const name = get("user/name");
```

## State Management Patterns

### Tree State

Tree state is useful for nested data structures and path-based access:

```typescript
import { set, get, subscribe } from "./bonsai/tree";

// Set values at paths
set("user/name", "John");
set("user/age", 30);
set("settings/theme", "dark");

// Get values
const name = get("user/name");
const age = get("user/age");

// Subscribe to changes
const unsubscribe = subscribe("user/name", (value) => {
  console.log("Name changed:", value);
});

// Later, unsubscribe
unsubscribe();
```

### Flat State

Flat state is simpler and works well for single-level state:

```typescript
import { useBonsai, setState } from "./bonsai/flat";

// In a React component
function Counter() {
  const count = useBonsai((state) => state.count ?? 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setState({ count: count + 1 })}>Increment</button>
    </div>
  );
}
```

### Scoped State

Scoped state is useful for component-specific state:

```typescript
import { createBonsaiStore } from "./bonsai/createStore";

// Create a scoped store
const userStore = createBonsaiStore<{ name: string }>();

// In a React component
function UserProfile() {
  const name = userStore.use((state) => state.name ?? "No one");

  return (
    <div>
      <p>{name}</p>
      <button onClick={() => userStore.set({ name: "John" })}>Set Name</button>
    </div>
  );
}
```

## Middleware System

### Basic Middleware Usage

```typescript
import { useTreeMiddleware } from "./bonsai/tree";

// Register middleware
useTreeMiddleware((path, nextVal, oldVal) => {
  console.log(`${path} changed from`, oldVal, "to", nextVal);
  return nextVal;
});
```

### Built-in Middleware

Bonsai provides several middleware creators:

#### 1. Validation Middleware

```typescript
const ageValidator = createValidationMiddleware<number>((path, nextValue) => {
  if (nextValue < 0 || nextValue > 120) {
    return "Age must be between 0 and 120";
  }
  return true;
});
```

#### 2. Logging Middleware

```typescript
const logger = createLoggingMiddleware({
  logPath: true,
  logValue: true,
  logPrevValue: true,
});
```

#### 3. Debounce Middleware

```typescript
const debouncer = createDebounceMiddleware(300); // 300ms delay
```

#### 4. Throttle Middleware

```typescript
const throttler = createThrottleMiddleware(1); // 1 update per second
```

#### 5. Persistence Middleware

```typescript
const persister = createPersistenceMiddleware("myAppState");
```

#### 6. Time Window Middleware

```typescript
const timeWindow = createTimeWindowMiddleware([
  9, 10, 11, 12, 13, 14, 15, 16, 17,
]);
```

## React Integration

### Tree State Hook

```typescript
import { useTreeBonsai } from "./bonsai/usetreebonsai";

function UserProfile() {
  const name = useTreeBonsai("user/name");
  const age = useTreeBonsai("user/age");

  return (
    <div>
      <p>Name: {name ?? "Unknown"}</p>
      <p>Age: {age ?? "?"}</p>
      <button onClick={() => set("user/name", "John")}>Set Name</button>
    </div>
  );
}
```

### Flat State Hook

```typescript
import { useBonsai, setState } from "./bonsai/flat";

function Counter() {
  const count = useBonsai((state) => state.count ?? 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setState({ count: count + 1 })}>Increment</button>
    </div>
  );
}
```

## Common Patterns

### Form Handling with Validation

```typescript
initTreeState({
  initialState: {
    form: {
      username: "",
      password: "",
      email: "",
    },
  },
  middleware: [
    createDebounceMiddleware(300),
    createLoggingMiddleware({ logValue: false }), // Don't log sensitive data
    createPersistenceMiddleware("formState"),
  ],
});
```

### API Integration with Debouncing

```typescript
const apiMiddleware = createAsyncMiddleware(async (path, nextValue) => {
  await fetch("/api/update", {
    method: "POST",
    body: JSON.stringify({ path, value: nextValue }),
  });
  return nextValue;
});

initTreeState({
  initialState: { searchQuery: "" },
  middleware: [createDebounceMiddleware(500), apiMiddleware],
});
```

## Best Practices

1. **Initialize Early**: Set up your state and middleware before React mounts
2. **Choose the Right Pattern**: Use tree state for nested data, flat state for simple data
3. **Compose Middleware**: Chain multiple middleware functions for complex behaviors
4. **Handle Errors**: Always handle potential errors in async middleware
5. **Secure Sensitive Data**: Don't log sensitive information
6. **Use TypeScript**: Leverage TypeScript for better type safety
7. **Keep State Minimal**: Only store what you need in global state
8. **Use Scoped State**: Use scoped state for component-specific data

## DevTools Integration

Bonsai includes a powerful development panel for debugging and monitoring state changes.

### DevPanel Component

```typescript
import { DevPanel } from "./devtools/dev-panel";

function App() {
  return (
    <div>
      {/* Your app components */}
      <DevPanel />
    </div>
  );
}
```

The DevPanel provides:

- Real-time state visualization
- State change logs
- Path exploration
- Middleware debugging

### Logging System

```typescript
import { addLog, getLogs } from "./bonsai/devlog";

// Add custom logs
addLog("User logged in");

// Get all logs
const logs = getLogs();
```

## Path Utilities

### Getting All State Paths

```typescript
import { get } from "./bonsai/tree";

function getAllPaths(obj: any, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix.slice(0, -1)];
  return Object.entries(obj).flatMap(([key, val]) =>
    getAllPaths(val, prefix + key + "/")
  );
}

// Usage
const state = get(""); // Get root state
const paths = getAllPaths(state);
console.log("Available paths:", paths);
```

### Path-Based Patterns

```typescript
// Wildcard subscriptions
subscribe("user/*", (value) => {
  console.log("Any user property changed:", value);
});

// Nested path updates
set("user/profile/address/city", "New York");

// Batch updates
set("user/profile", {
  name: "John",
  age: 30,
  address: {
    city: "New York",
    country: "USA",
  },
});
```

## Advanced Middleware Composition

### Middleware Order

Middleware executes in the order they are provided:

```typescript
initTreeState({
  initialState: { user: { name: "" } },
  middleware: [
    // 1. First, validate the input
    createValidationMiddleware((path, value) => {
      if (path === "user/name" && value.length < 2) {
        return "Name too short";
      }
      return true;
    }),

    // 2. Then, transform the data
    createAsyncMiddleware(async (path, value) => {
      if (path === "user/name") {
        return value.trim();
      }
      return value;
    }),

    // 3. Finally, log the changes
    createLoggingMiddleware(),
  ],
});
```

### Conditional Middleware

```typescript
const conditionalMiddleware = createAsyncMiddleware(async (path, value) => {
  // Only apply to specific paths
  if (path.startsWith("user/")) {
    // Apply special handling for user data
    return value;
  }

  // Pass through for other paths
  return value;
});
```

### Error Handling in Middleware Chains

```typescript
const errorHandlingMiddleware = createAsyncMiddleware(async (path, value) => {
  try {
    // Attempt the operation
    const result = await someAsyncOperation(value);
    return result;
  } catch (error) {
    // Log the error
    console.error(`Error in middleware for path "${path}":`, error);

    // Return false to block the update
    return false;
  }
});
```

### Middleware with State Access

```typescript
const stateAwareMiddleware = createAsyncMiddleware(async (path, value) => {
  // Get current state
  const currentState = get(path);

  // Make decisions based on current state
  if (currentState === value) {
    return false; // Block update if value hasn't changed
  }

  return value;
});
```

## Performance Considerations

1. **Middleware Optimization**

   - Keep middleware functions pure when possible
   - Use memoization for expensive computations
   - Avoid unnecessary state updates

2. **Subscription Management**

   - Unsubscribe from paths you no longer need
   - Use specific paths instead of wildcards when possible
   - Batch related updates

3. **State Structure**
   - Keep state normalized
   - Avoid deeply nested structures
   - Use appropriate state patterns (tree vs flat)

## Troubleshooting

### Common Issues

1. **Middleware Not Executing**

   - Check middleware order
   - Verify middleware registration
   - Ensure middleware returns a value

2. **State Updates Not Reflecting**

   - Check for blocked updates (middleware returning false)
   - Verify subscription paths
   - Check for type mismatches

3. **Performance Issues**
   - Monitor middleware execution time
   - Check for unnecessary re-renders
   - Use the DevPanel to track state changes

### Debugging Tips

1. Use the DevPanel to:

   - Monitor state changes
   - Track middleware execution
   - View available paths
   - Check for blocked updates

2. Add logging middleware:

   ```typescript
   const debugMiddleware = createLoggingMiddleware({
     logPath: true,
     logValue: true,
     logPrevValue: true,
   });
   ```

3. Use TypeScript for better error catching:

   ```typescript
   interface UserState {
     name: string;
     age: number;
   }

   const userStore = createBonsaiStore<UserState>();
   ```

## API Reference

### Core Functions

- `initTreeState(config)`: Initialize the state system
- `set(path, value)`: Set a value at a path
- `get(path)`: Get a value at a path
- `subscribe(path, callback)`: Subscribe to changes

### React Hooks

- `useTreeBonsai(path)`: Hook for tree state
- `useBonsai(selector)`: Hook for flat state
- `createBonsaiStore<T>()`: Create a scoped store

### Middleware Creators

- `createAsyncMiddleware(handler)`
- `createValidationMiddleware(validator)`
- `createLoggingMiddleware(options)`
- `createDebounceMiddleware(delay)`
- `createThrottleMiddleware(limit)`
- `createPersistenceMiddleware(key)`
- `createTimeWindowMiddleware(allowedHours)`
