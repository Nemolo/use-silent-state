import { type Dispatch, type SetStateAction, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

export type SubscriptionFn<S> = (data: S) => void;
export type SilentState<S> = {
  get: () => S;
  subscribe: (fn: SubscriptionFn<S>) => () => void;
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
    ref.current = typeof value === 'function' ? (value as (prev: T) => T)(ref.current) : value;
    subscriptionsRef.current.forEach((fn) => fn(ref.current));
  }, []);

  return useMemo(() => ({ get, set, subscribe }), [get, set, subscribe]);
}

export function useWatchSilentState<T>(state: Pick<SilentState<T>, 'get' | 'subscribe'>): T;
export function useWatchSilentState<T, D>(
  state: Pick<SilentState<T>, 'get' | 'subscribe'>,
  selector: (data: T) => D
): D;
export function useWatchSilentState<T, D = T>(
  { get, subscribe }: Pick<SilentState<T>, 'get' | 'subscribe'>,
  selector?: (data: T) => D
): T | D {
  const select = selector ?? ((d: T) => d as unknown as D);
  // memoize the subscribe wrapper so useSyncExternalStore doesn't re-subscribe on every render
  return useSyncExternalStore(
    subscribe,
    () => select(get()),
    /* v8 ignore next */
    () => select(get())
  );
}
