import { createSelector, Selector } from '@veksa/reselect';

export function createSequenceSelector<S, R>(
  selectors: Selector<S, R>[],
  selectorCreator?: typeof createSelector,
): Selector<S, R[]>;

export function createSequenceSelector<S, P, R>(
  selectors: Selector<S, R, [P]>[],
  selectorCreator?: typeof createSelector,
): Selector<S, R[], [P]>;

export function createSequenceSelector(selectors: any, selectorCreator = createSelector) {
  return selectorCreator(selectors, (...results: unknown[]) => results);
}
