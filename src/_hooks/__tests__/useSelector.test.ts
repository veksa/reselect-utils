import { createElement, ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from '@veksa/react-redux';
import { useSelector } from '../useSelector';

type State = { count: number };

const createMockStore = (state: State) => {
  const listeners = new Set<() => void>();

  const store = {
    getState: () => state,
    dispatch: (action: unknown) => action,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    replaceReducer: () => undefined,
    [Symbol.observable ?? '@@observable']() {
      return this;
    },
  };

  return store as unknown as never;
};

const wrapperWith =
  (store: never) =>
  ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store, children });

describe('useSelector', () => {
  const state: State = { count: 5 };

  test('returns the selector result for the current state and props', () => {
    const store = createMockStore(state);

    const { result } = renderHook(
      () =>
        useSelector((s: State, props: { factor: number }) => s.count * props.factor, { factor: 2 }),
      { wrapper: wrapperWith(store) },
    );

    expect(result.current).toBe(10);
  });

  test('stabilizes shallow-equal props between renders', () => {
    const store = createMockStore(state);
    const selector = vi.fn((s: State, props: { factor: number }) => s.count * props.factor);

    const { rerender } = renderHook(({ props }) => useSelector(selector, props), {
      wrapper: wrapperWith(store),
      initialProps: { props: { factor: 2 } },
    });

    rerender({ props: { factor: 2 } });

    const propsArgs = selector.mock.calls.map((call) => call[1]);
    // A new-but-shallow-equal props object must not reach the selector as a new reference.
    expect(new Set(propsArgs).size).toBe(1);
  });

  test('unfreezes frozen props before passing them to the selector', () => {
    const store = createMockStore(state);
    let receivedProps: { factor: number } | undefined;

    renderHook(
      () =>
        useSelector(
          (s: State, props: { factor: number }) => {
            receivedProps = props;
            return s.count;
          },
          Object.freeze({ factor: 2 }),
        ),
      { wrapper: wrapperWith(store) },
    );

    expect(Object.isFrozen(receivedProps)).toBe(false);
    expect(receivedProps?.factor).toBe(2);
  });
});
