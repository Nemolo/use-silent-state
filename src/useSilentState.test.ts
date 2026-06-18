import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useSilentState } from "./useSilentState";

describe("useSilentState", () => {
  it("returns the initial value via get()", () => {
    const { result } = renderHook(() => useSilentState(42));
    expect(result.current.get()).toBe(42);
  });

  it("updates the value without re-rendering", () => {
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

  it("supports updater function", () => {
    const { result } = renderHook(() => useSilentState(10));

    act(() => {
      result.current.set((prev) => prev + 5);
    });

    expect(result.current.get()).toBe(15);
  });

  it("works with object values", () => {
    const { result } = renderHook(() => useSilentState({ count: 0 }));

    act(() => {
      result.current.set((prev) => ({ ...prev, count: prev.count + 1 }));
    });

    expect(result.current.get()).toEqual({ count: 1 });
  });
});
