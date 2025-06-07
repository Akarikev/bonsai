---
# Bonsai State Management Library 🌳✨

Welcome to **Bonsai**, a lightweight, flexible state management library designed to grow with your app’s needs — from simple flat state trees to deeply nested hierarchical states.
---

## What is Bonsai?

Bonsai is a modern state management toolkit for React (and beyond) that combines the simplicity of flat state with the power of tree-structured state management. Inspired by the elegance of bonsai trees, it helps you prune and shape your app state efficiently without overwhelming boilerplate.

---

## Why Bonsai?

- **Flexibility** — Use a **flat state system** for quick, global state management, or switch to a **tree-based system** for fine-grained, nested state updates.
- **Performance** — Powered by React's `useSyncExternalStore`, ensuring efficient updates and minimal re-renders.
- **Middleware support** — Intercept, modify, or block state changes easily.
- **Subscriptions & Selectors** — Listen to specific parts of the state to optimize renders.
- **Dev Panel (coming soon!)** — Debug and inspect your state tree with a visual interface.

---

## Features Built So Far

- **Flat State Management (`flat.ts`)**
  A simple key-value store with subscription, middleware, and selector support. Great for straightforward app state.

- **Tree State Management (`tree.ts`)**
  Handles deeply nested state paths like `"user/profile/name"`, allowing subscription and updates at any node in the tree, complete with middleware that can transform or block updates.

- **Hooks**

  - `useBonsai` for the flat state system
  - `useTreeBonsai` for the tree state system

- **Middleware API**
  Register middleware functions to intercept state changes and customize behavior.

---

## What Bonsai Aims to Achieve

- Provide an elegant API that scales from simple to complex app states without friction.
- Offer a robust middleware system to enable logging, validation, persistence, and more.
- Deliver performant React integration leveraging modern React APIs.
- Build a Dev Panel UI to visualize and manipulate the state tree easily.
- Support micro-frontends and modular architectures by enabling isolated state slices.

---

## Current Status

- Core flat and tree state management implementations are stable and fully functional.
- Middleware support is implemented and working in both systems.
- Hooks for React integration are in place and tested.
- Dev Panel UI is in early design; foundational pieces are set but not shipped.
- Documentation and examples are being drafted for smoother onboarding.

---

## Next Steps & Roadmap

- 🚀 **Subscription Enhancements:** Fine-tune subscriptions for batch updates and selective rendering.
- 🎛️ **Middleware Expansion:** Add more middleware utilities (async, side effects, persistence).
- 🛠️ **Dev Panel:** Build a powerful, intuitive UI for debugging and state inspection.
- 🌐 **Micro-Frontend Support:** Facilitate isolated state management for modular apps.
- 📚 **Examples & Docs:** Provide rich guides, use-cases, and tutorials for developers.
- 🤝 **Community & Contributions:** Open Bonsai to contributions, feedback, and collaborations.

---

## How to Use

You can start with the flat state system for simple global state needs:

```ts
import { useBonsai, setState } from "./bonsai/flat";

function Counter() {
  const count = useBonsai((state) => state.count || 0);

  return (
    <button onClick={() => setState({ count: count + 1 })}>
      Count: {count}
    </button>
  );
}
```

Or leverage the tree system for nested state:

```ts
import { useTreeBonsai, set } from "./bonsai/tree";

function UserProfile() {
  const name = useTreeBonsai("user/profile/name") || "Guest";

  return (
    <input
      value={name}
      onChange={(e) => set("user/profile/name", e.target.value)}
    />
  );
}
```

---

## Join the Journey

Bonsai is a work-in-progress, crafted with love and vision. If you’re interested in contributing, sharing ideas, or just watching it grow, stay tuned and get involved!
