import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSilentState, useWatchSilentState } from './useSilentState';

describe('useSilentState', () => {
  it('returns the initial value via get()', () => {
    const { result } = renderHook(() => useSilentState(42));
    expect(result.current.get()).toBe(42);
  });

  it('updates the value without re-rendering', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount++;
      return useSilentState(0);
    });

    act(() => {
      result.current.set(99);
    });

    expect(result.current.get()).toBe(99);
    expect(renderCount).toBe(1);
  });

  it('supports updater function', () => {
    const { result } = renderHook(() => useSilentState(10));

    act(() => {
      result.current.set((prev) => prev + 5);
    });

    expect(result.current.get()).toBe(15);
  });

  it('works with object values', () => {
    const { result } = renderHook(() => useSilentState({ count: 0 }));

    act(() => {
      result.current.set((prev) => ({ ...prev, count: prev.count + 1 }));
    });

    expect(result.current.get()).toEqual({ count: 1 });
  });
});

describe('useWatchSilentState', () => {
  it('returns the initial value', () => {
    const { result: silent } = renderHook(() => useSilentState(42));
    const { result: watched } = renderHook(() => useWatchSilentState(silent.current));

    expect(watched.current).toBe(42);
  });

  it('re-renders when set() is called', async () => {
    const { result: silent } = renderHook(() => useSilentState(0));
    let renderCount = 0;
    const { result: watched } = renderHook(() => {
      renderCount++;
      return useWatchSilentState(silent.current);
    });

    expect(watched.current).toBe(0);
    expect(renderCount).toBe(1);

    act(() => {
      silent.current.set(99);
    });

    expect(watched.current).toBe(99);
    expect(renderCount).toBe(2);
  });

  it('applies selector and re-renders with selected value', () => {
    const { result: silent } = renderHook(() => useSilentState({ count: 0, name: 'test' }));
    const { result: watched } = renderHook(() => useWatchSilentState(silent.current, (s) => s.count));

    expect(watched.current).toBe(0);

    act(() => {
      silent.current.set((prev) => ({ ...prev, count: 5 }));
    });

    expect(watched.current).toBe(5);
  });

  it('does not re-render when selector returns the same value', () => {
    const { result: silent } = renderHook(() => useSilentState({ count: 0, name: 'test' }));
    let renderCount = 0;
    const { result: watched } = renderHook(() => {
      renderCount++;
      return useWatchSilentState(silent.current, (s) => s.count);
    });

    expect(watched.current).toBe(0);
    expect(renderCount).toBe(1);

    act(() => {
      silent.current.set((prev) => ({ ...prev, name: 'changed' }));
    });

    expect(watched.current).toBe(0);
    expect(renderCount).toBe(1);
  });
});
