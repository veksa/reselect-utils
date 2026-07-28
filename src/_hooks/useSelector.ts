import { shallowEqual, useSelector as useReduxSelector } from '@veksa/react-redux';
import { useMemoWith } from './useMemoWith';
import { useCallback, useMemo } from 'react';

export function useSelector<S extends object, R>(selector: (state: S) => R): R;

export function useSelector<S extends object, P, R>(
  selector: (state: S, props: P) => R,
  props: P,
): R;

export function useSelector(selector: Function, ...params: any[]) {
  const props = params[0];
  const memoizedProps = useMemoWith(props, shallowEqual);

  // unfreeze props for performance optimization (see temporaryAssign.ts)
  const unfrozenProps = useMemo(() => {
    return Object.isFrozen(memoizedProps) ? { ...memoizedProps } : memoizedProps;
  }, [memoizedProps]);

  const memoizedPropsSelector = useCallback(
    (state: unknown) => {
      return selector(state, unfrozenProps);
    },
    [selector, unfrozenProps],
  );

  return useReduxSelector(memoizedPropsSelector, {
    devModeChecks: {
      stabilityCheck: 'never',
      identityFunctionCheck: 'never',
    },
  });
}
