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
npm install @bonsai/state

# Using yarn
yarn add @bonsai/state

# Using pnpm
pnpm add @bonsai/state

# Using bun
bun add @bonsai/state
```

## Quick Start

```tsx
import { initTreeState, useTreeBonsai, set, DevPanel } from "@bonsai/state";

// Initialize state
initTreeState({
  initialState: {
    user: { name: "", age: 0 },
    todos: [],
  },
});

// Use in components
function UserProfile() {
  const name = useTreeBonsai("user/name");
  const age = useTreeBonsai("user/age");

  return (
    <div>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <button onClick={() => set("user/age", age + 1)}>Increment Age</button>
    </div>
  );
}

// Add DevPanel for debugging
function App() {
  return (
    <div>
      <UserProfile />
      <DevPanel />
    </div>
  );
}
```

## More Examples

### Tree State with Middleware

```tsx
import {
  initTreeState,
  useTreeBonsai,
  set,
  createMiddleware,
} from "@bonsai/state";

// Create a validation middleware
const validateAge = createMiddleware((path, nextValue) => {
  if (path === "user/age" && nextValue < 0) {
    return false; // Block update
  }
  return nextValue;
});

// Initialize with middleware
initTreeState({
  initialState: { user: { age: 0 } },
  middleware: [validateAge],
});

function AgeControl() {
  const age = useTreeBonsai("user/age");
  return (
    <div>
      <button onClick={() => set("user/age", age - 1)}>Decrease</button>
      <span>{age}</span>
      <button onClick={() => set("user/age", age + 1)}>Increase</button>
    </div>
  );
}
```

### Scoped State

```tsx
import { createStore, useStore } from "@bonsai/state";

function Counter() {
  const store = createStore({ count: 0 });
  const count = useStore(store, "count");

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => store.set("count", count + 1)}>Increment</button>
    </div>
  );
}
```

### Flat State with Selectors

```tsx
import { createFlatStore, useFlatStore } from "@bonsai/state";

const store = createFlatStore({
  todos: [],
  filter: "all",
});

function TodoList() {
  const todos = useFlatStore(store, (state) =>
    state.todos.filter((todo) =>
      state.filter === "all"
        ? true
        : state.filter === "active"
        ? !todo.completed
        : todo.completed
    )
  );

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
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
   const localStore = createStore({ count: 0 });
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
