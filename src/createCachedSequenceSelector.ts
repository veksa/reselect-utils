import { createSelector, Selector } from '@veksa/reselect';
import { ParametricSelector, createCachedSelector } from '@veksa/re-reselect';
import { Options, ParametricOptions } from './types';
import { createSequenceSelector } from './createSequenceSelector';

export function createCachedSequenceSelector<S, R>(
  selectors: Selector<S, R, never>[],
): (
  options: Options<S, (...results: R[]) => R[], Selector<S, R, never>[]>,
) => Selector<S, R[], never>;

export function createCachedSequenceSelector<S, P, R>(
  selectors: ParametricSelector<S, P, R>[],
): (
  options: ParametricOptions<
    S,
    P,
    (...results: R[]) => R[],
    ParametricSelector<S, P, R>[]
  >,
) => ParametricSelector<S, P, R[]>;

export function createCachedSequenceSelector(selectors: any): any {
  return createSequenceSelector(
    selectors,
    (createCachedSelector as unknown) as typeof createSelector,
  );
}
