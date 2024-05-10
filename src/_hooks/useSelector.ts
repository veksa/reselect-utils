import { shallowEqual, useSelector as useReduxSelector } from 'react-redux';
import { useMemoWith } from './useMemoWith';
import { useCallback, useMemo } from 'react';

/* eslint-disable etc/prefer-interface */
export type Selector<S, R> = (state: S) => R;
export type ParametricSelector<S, P, R> = (state: S, props: P, ...args: any[]) => R;

/* eslint-enable */

export function useSelector<S extends object, R>(
  selector: Selector<S, R>,
): R;

export function useSelector<S extends object, P extends object, R>(
  selector: ParametricSelector<S, P, R>,
  props: P,
): R;

export function useSelector(selector: Function, props?: any) {
  const memoizedProps = useMemoWith(props, shallowEqual);

  // unfreeze props for performance optimization (see temporaryAssign.ts)
  const unfrozenProps = useMemo(() => {
    return Object.isFrozen(memoizedProps)
      ? {...memoizedProps}
      : memoizedProps;
  }, [memoizedProps]);

  const memoizedPropsSelector = useCallback((state: unknown) => {
    return selector(state, unfrozenProps);
  }, [selector, unfrozenProps]);

  return useReduxSelector(memoizedPropsSelector, {
    devModeChecks: {
      stabilityCheck: 'never',
      identityFunctionCheck: 'never',
    },
  });
}
