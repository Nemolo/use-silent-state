import { useRef, useCallback } from "react";

export type SilentState<T> = {
  get: () => T;
  set: (value: T | ((prev: T) => T)) => void;
};

/**
 * Like useState, but mutations never trigger a re-render.
 * Use when you need mutable state shared across closures without re-rendering.
 */
export function useSilentState<T>(initialValue: T): SilentState<T> {
  const ref = useRef<T>(initialValue);

  const get = useCallback(() => ref.current, []);

  const set = useCallback((value: T | ((prev: T) => T)) => {
    ref.current =
      typeof value === "function"
        ? (value as (prev: T) => T)(ref.current)
        : value;
  }, []);

  return { get, set };
}
