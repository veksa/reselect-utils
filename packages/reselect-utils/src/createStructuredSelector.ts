import { createSelector, ParametricSelector, Selector } from 'reselect';

export function createStructuredSelector<M>(
  selectors: M,
  selectorCreator?: typeof createSelector,
): M extends { [K in keyof M]: Selector<infer S, unknown> }
  ? Selector<S, { [K in keyof M]: ReturnType<M[K]> }>
  : M extends { [K in keyof M]: ParametricSelector<infer S, infer P, unknown> }
  ? ParametricSelector<S, P, { [K in keyof M]: ReturnType<M[K]> }>
  : never;

export function createStructuredSelector(
  selectors: Record<
    PropertyKey,
    Selector<any, any> | ParametricSelector<any, any, any>
  >,
  selectorCreator = createSelector,
): any {
  const objectKeys = Object.keys(selectors);
  return selectorCreator(
    objectKeys.map(key => selectors[key]),
    (...values) => {
      return values.reduce((composition, value, index) => {
        return {
          ...composition,
          [objectKeys[index]]: value,
        };
      }, {});
    },
  );
}
