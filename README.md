# Bonsai State Management 🌳

A flexible state management library with tree and flat state support, middleware, and dev tools.

## Features

- 🌳 **Tree State**: Manage nested state with path-based access
- 🌿 **Flat State**: Simple key-value state management
- 🪴 **Scoped State**: Isolated state stores for components
- 🔌 **Middleware**: Transform or block state updates
- 🛠️ **DevTools**: Visual debugging and state inspection
- 📦 **TypeScript**: Full type safety and autocompletion

## Prerequisites

- React >= 18.2.0

## Installation

```bash
npm install @bonsai/state
# or
yarn add @bonsai/state
# or
pnpm add @bonsai/state
#or
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

## Documentation

For detailed documentation, visit our [documentation site](https://github.com/Akarikev/bonsai#readme).

### Key Concepts

1. **Tree State**

   - Path-based state access
   - Nested state management
   - Middleware support

2. **Flat State**

   - Simple key-value store
   - Selector-based access
   - Direct state updates

3. **Scoped State**

   - Component-specific state
   - Isolated state stores
   - Type-safe access

4. **Middleware**

   - Validation
   - Logging
   - Debouncing
   - Persistence

5. **DevTools**
   - State visualization
   - Real-time updates
   - Path inspection
   - Log viewer

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

## License

MIT © Prince Elorm(Akarikev)
