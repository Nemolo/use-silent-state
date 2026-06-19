import { useSyncExternalStore } from 'react';
import type { SilentState } from './useSilentState';

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
