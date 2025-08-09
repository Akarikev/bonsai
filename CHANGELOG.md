# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [1.1.0] - 2025-08-09

### Added

- `createStore(initialState, { devtools, middleware })`: one-call setup for tree state.
- DevTools auto-mount via `devtools: true` (no component import needed).
- DevTools UI redesign: tabs (State, Inspector, Logs, Settings), draggable, resizable, search, copy feedback, hotkey (Ctrl+Shift+B).
- Koa-style middleware adapter: `(next) => (path, value, prev) => next(path, value)`.

### Docs

- README and docs updated with createStore-first quick start, migration guide, and FAQ.
- Examples show both `createStore` and classic API usage.

### Compatibility

- No breaking changes. Classic APIs (`initTreeState`, `useTreeBonsai`, `set`, `get`, `subscribe`) remain supported.

### Migration (optional)

- Initialize with `createStore`:
  ```ts
  export const store = createStore({ count: 0 }, { devtools: true });
  ```
- Replace as needed:
  - `useTreeBonsai(path)` → `store.use(path)`
  - `set(path, value)` → `store.set(path, value)` (async)
  - `subscribe(path, cb)` → `store.subscribe(path, cb)`

[1.1.0]: https://github.com/Akarikev/bonsai/releases/tag/v1.1.0
