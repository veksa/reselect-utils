import { Selector } from '@veksa/reselect';
import { CachedSelector } from './types';
import { isCachedSelector } from './_helpers/isCachedSelector';
import { defaultKeySelector } from './keys/defaultKeySelector';

/**
 * Creates a selector that always resolves to `undefined`. Used as the "no link"
 * branch of a chain (e.g. an optional relation that isn't present).
 *
 * When the base selector is cached, the empty selector is tagged with
 * {@link defaultKeySelector} so that it still passes {@link isCachedSelector}
 * and takes part in key-selector composition. The default key is deliberately
 * the only cache-related metadata copied: an empty selector has no result to
 * memoize, so it needs no `cache` / `getMatchingSelector` of its own, and the
 * default key is dropped by `excludeDefaultSelectors` during composition.
 */
export const createEmptySelector = <S, R>(
  baseSelector: Selector<S, R, any[]>,
): Selector<S, R | undefined> => {
  const emptySelector = () => undefined;

  if (isCachedSelector(baseSelector)) {
    (emptySelector as unknown as CachedSelector).keySelector = defaultKeySelector;
  }

  return emptySelector;
};
