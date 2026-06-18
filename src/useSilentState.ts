import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useRef,
} from "react";

export type SubscriptionFn<S> = (data: S) => void;
export type SilentState<S> = {
  get: () => S;
  subscribe: (fn: SubscriptionFn<S>) => void;
  set: Dispatch<SetStateAction<S>>;
};

/**
 * Like useState, but mutations never trigger a re-render.
 * Use when you need mutable state shared across closures without re-rendering.
 */
export function useSilentState<T>(initialValue: T): SilentState<T> {
  const ref = useRef<T>(initialValue);

  const get = useCallback(() => ref.current, []);
  const subscriptionsRef = useRef(new Set<SubscriptionFn<T>>());
  const subscribe = useCallback((fn: (data: T) => void) => {
    subscriptionsRef.current.add(fn);
    return () => {
      subscriptionsRef.current.delete(fn);
    };
  }, []);
  const set = useCallback((value: T | ((prev: T) => T)) => {
    ref.current =
      typeof value === "function"
        ? (value as (prev: T) => T)(ref.current)
        : value;
    subscriptionsRef.current.forEach((fn) => fn(ref.current));
  }, []);

  return useMemo(() => ({ get, set, subscribe }), []);
}
