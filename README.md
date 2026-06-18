# use-silent-state

[![CI](https://github.com/Nemolo/use-silent-state/actions/workflows/publish.yml/badge.svg)](https://github.com/Nemolo/use-silent-state/actions/workflows/publish.yml)
[![npm](https://img.shields.io/npm/v/use-silent-state)](https://www.npmjs.com/package/use-silent-state)
[![license](https://img.shields.io/npm/l/use-silent-state)](./LICENSE)

A React hook for mutable state that doesn't trigger re-renders, with opt-in subscription for components that need to watch it.

## Why

React's `useState` always re-renders on every update. `useRef` avoids re-renders but offers no subscription mechanism. `use-silent-state` sits in the middle: state is mutated silently (no re-render), and only the components that explicitly watch it will re-render when it changes.

Common use cases:

- Tracking transient UI state (drag position, scroll offset, hover) without polluting the render cycle
- Sharing mutable state across closures inside a component without causing re-renders on every keystroke
- Fine-grained control over which components react to state changes

## Installation

```bash
pnpm add use-silent-state
# or
npm install use-silent-state
```

Requires React 16 or later.

## API

### `useSilentState<T>(initialValue: T): SilentState<T>`

Creates a piece of silent state. Returns a `SilentState` object with three methods:

| Method | Description |
| -------- | ------------- |
| `get()` | Returns the current value |
| `set(value \| updater)` | Updates the value and notifies subscribers. Supports updater functions like `useState`. |
| `subscribe(fn)` | Registers a callback invoked on every `set()`. Returns an unsubscribe function. |

Calling `set()` **never triggers a re-render** in the component that owns the state.

```tsx
function MyComponent() {
  const position = useSilentState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    // updates value, no re-render
    position.set({ x: e.clientX, y: e.clientY });
  };

  return <div onMouseMove={handleMouseMove}>...</div>;
}
```

### `useWatchSilentState<T>(state): T`

### `useWatchSilentState<T, D>(state, selector): D`

Subscribes a component to a `SilentState`. The component re-renders whenever `set()` is called (or only when the selected value changes, if a selector is provided).

```tsx
// re-renders on every change
const position = useWatchSilentState(positionState);

// re-renders only when x changes
const x = useWatchSilentState(positionState, (p) => p.x);
```

Uses `useSyncExternalStore` internally — safe for React 18 Concurrent Mode, no double-render gap.

#### Selector and object values

`useSyncExternalStore` compares snapshots with `Object.is`. A selector that returns a **new object on every call** loses its optimization benefit: even if the selected fields didn't change, `Object.is({}, {})` is always `false`, so the component re-renders on every store update.

```tsx
// ✅ primitive — compared by value, re-renders only when the value changes
const count = useWatchSilentState(state, (s) => s.count);

// ⚠️ object — re-renders on every store update regardless of whether x/y changed
const point = useWatchSilentState(state, (s) => ({ x: s.x, y: s.y }));
```

If you need a derived object, select primitives and compose them with `useMemo`:

```tsx
const x = useWatchSilentState(state, (s) => s.x);
const y = useWatchSilentState(state, (s) => s.y);
const point = useMemo(() => ({ x, y }), [x, y]);
```

## Full example

```tsx
import { useSilentState, useWatchSilentState } from 'use-silent-state';

// Parent owns the state — no re-renders here
function Parent() {
  const counter = useSilentState(0);

  return (
    <>
      <button onClick={() => counter.set((n) => n + 1)}>Increment</button>
      <Display counter={counter} />
    </>
  );
}

// Only this component re-renders when counter changes
function Display({ counter }: { counter: SilentState<number> }) {
  const value = useWatchSilentState(counter);
  return <p>Count: {value}</p>;
}
```

## TypeScript

All types are exported:

```ts
import type { SilentState, SubscriptionFn } from 'use-silent-state';
```

## License

MIT
