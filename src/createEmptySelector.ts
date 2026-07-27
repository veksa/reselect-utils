import { Selector } from '@veksa/reselect';
import { CachedSelector } from './types';
import { isCachedSelector } from './_helpers/isCachedSelector';
import { defaultKeySelector } from './keys/defaultKeySelector';

export const createEmptySelector = <S, R>(
  baseSelector: Selector<S, R, any[]>,
): Selector<S, R | undefined> => {
  const emptySelector = () => undefined;

  if (isCachedSelector(baseSelector)) {
    const cachedEmptySelector = emptySelector as unknown as CachedSelector;

    cachedEmptySelector.keySelector = defaultKeySelector;
  }

  return emptySelector;
};
