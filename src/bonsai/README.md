# Bonsai State Management

Bonsai is a flexible state management system with a powerful middleware architecture. This guide explains how to use the middleware system effectively.

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

## Middleware Types

Bonsai provides several built-in middleware creators:

### 1. Validation Middleware

```typescript
const ageValidator = createValidationMiddleware<number>((path, nextValue) => {
  if (nextValue < 0 || nextValue > 120) {
    return "Age must be between 0 and 120";
  }
  return true;
});
```

### 2. Logging Middleware

```typescript
const logger = createLoggingMiddleware({
  logPath: true,
  logValue: true,
  logPrevValue: true,
});
```

### 3. Debounce Middleware

```typescript
const debouncer = createDebounceMiddleware(300); // 300ms delay
```

### 4. Throttle Middleware

```typescript
const throttler = createThrottleMiddleware(1); // 1 update per second
```

### 5. Persistence Middleware

```typescript
const persister = createPersistenceMiddleware("myAppState");
```

### 6. Time Window Middleware

```typescript
const timeWindow = createTimeWindowMiddleware([
  9, 10, 11, 12, 13, 14, 15, 16, 17,
]);
```

## Common Patterns

### Form Handling

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

### API Integration

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

### Complex Validation

```typescript
const userValidator = createValidationMiddleware((path, nextValue) => {
  if (path === "user/age" && (nextValue < 0 || nextValue > 120)) {
    return "Invalid age";
  }
  if (path === "user/name") {
    return nextValue.trim();
  }
  return true;
});
```

## Real-World Example

Here's a complete example from the demo:

```typescript
// Initialize state
set("user/name", "  Elorm the Wise  "); // middleware will trim
set("user/age", 300); // blocked by middleware
set("user/age", 35); // allowed
set("settings/theme", "dark");
set("settings/volume", 80);

// Register middleware
useTreeMiddleware((path, nextVal, oldVal) => {
  // Log changes
  addLog(
    `🌳 ${path} changed from ${JSON.stringify(oldVal)} to ${JSON.stringify(
      nextVal
    )}`
  );

  // Validate age
  if (path === "user/age" && (nextVal < 0 || nextVal > 120)) {
    addLog(`❌ Blocked invalid age: ${nextVal}`);
    return false;
  }

  // Trim names
  if (path === "user/name") {
    const trimmed = nextVal.trim();
    addLog(`✂️ Trimmed name to "${trimmed}"`);
    return trimmed;
  }

  return nextVal;
});
```

## Best Practices

1. **Initialize Early**: Set up your state and middleware before React mounts
2. **Compose Middleware**: Chain multiple middleware functions for complex behaviors
3. **Handle Errors**: Always handle potential errors in async middleware
4. **Secure Sensitive Data**: Don't log sensitive information
5. **Use TypeScript**: Leverage TypeScript for better type safety

## Available Examples

Check out the `examples/middleware-usage.ts` file for more detailed examples:

- Basic middleware composition
- Async operations with debouncing
- Rate limiting with time windows
- Complex validation with async operations
- Form handling with debouncing and persistence

## API Reference

### Core Functions

- `initTreeState(config)`: Initialize the state system
- `set(path, value)`: Set a value at a path
- `get(path)`: Get a value at a path
- `subscribe(path, callback)`: Subscribe to changes

### Middleware Creators

- `createAsyncMiddleware(handler)`
- `createValidationMiddleware(validator)`
- `createLoggingMiddleware(options)`
- `createDebounceMiddleware(delay)`
- `createThrottleMiddleware(limit)`
- `createPersistenceMiddleware(key)`
- `createTimeWindowMiddleware(allowedHours)`
