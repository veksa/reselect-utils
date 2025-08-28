import {ParametricSelector, Selector} from '@veksa/re-reselect';
import {CachedSelector} from './types';
import {isCachedSelector} from './_helpers/isCachedSelector';
import {defaultKeySelector} from './keys/defaultKeySelector';

export const createEmptySelector = <S, P, R>(
    baseSelector: Selector<S, R> | ParametricSelector<S, P, R>,
): Selector<S, R | undefined> => {
    const emptySelector = () => undefined;

    if (isCachedSelector(baseSelector)) {
        const cachedEmptySelector = (emptySelector as unknown) as CachedSelector;

        cachedEmptySelector.keySelector = defaultKeySelector;
    }

    return emptySelector;
};
