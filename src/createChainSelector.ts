import {createCachedSelector, ICacheObject, KeySelector, ParametricSelector, Selector} from '@veksa/re-reselect';
import {KeySelectorComposer} from './keys/createKeySelectorComposer';
import {createSelectorCreator} from '@veksa/reselect';
import {isCachedSelector} from './_helpers/isCachedSelector';
import {defaultKeySelector} from './keys/defaultKeySelector';
import {stringComposeKeySelectors} from "./keys/stringComposeKeySelectors";
import {createKeySelectorCreator} from "./keys/createKeySelectorCreator";
import {isDebugMode} from "./debug/debug";
import {defineDynamicSelectorName} from "./_helpers/defineDynamicSelectorName";
import {getSelectorName} from "./_helpers/getSelectorName";
import {generateSelectorKey} from "./_helpers/generateSelectorKey";
import {stringifyFunction} from "./_helpers/stringifyFunction";

export type SelectorChain<R1, S1, P1, R2> = (result: R1) => Selector<S1, R2> | ParametricSelector<S1, P1, R2>;

export type SelectorChainHierarchy<
    C extends SelectorChain<any, any, any, any>,
    H extends SelectorChainHierarchy<any, any>
> = C & { parentChain?: H };

export type CreateSelectorOptions<SelectorCreator extends typeof createSelectorCreator> = {
    selectorCreator: ReturnType<SelectorCreator>;
    cacheObject: ICacheObject,
}

export type ChainSelectorOptions<SelectorCreator extends typeof createSelectorCreator = typeof createSelectorCreator> = {
    createSelectorOptions?: () => CreateSelectorOptions<SelectorCreator>;
    keySelectorComposer?: KeySelectorComposer;
};

export function createChainSelector<S1, P1, R1>(
    selector: Selector<S1, R1> | ParametricSelector<S1, P1, R1>,
    options?: ChainSelectorOptions,
    prevChain?: SelectorChainHierarchy<any, any>,
) {
    const chain = <S2, P2, R2>(fn: SelectorChain<R1, S2, P2, R2>, chainOptions?: ChainSelectorOptions) => {
        const combinedOptions = {
            ...options,
            ...chainOptions,
        };

        const keySelector = isCachedSelector(selector)
            ? selector.keySelector
            : defaultKeySelector;

        const {
            createSelectorOptions = () => ({}),
            keySelectorComposer = stringComposeKeySelectors,
        } = combinedOptions;

        const keySelectorCreator = createKeySelectorCreator(keySelectorComposer);

        const higherOrderSelector = createCachedSelector(
            [
                selector,
            ],
            fn,
        )({
            ...createSelectorOptions(),
            keySelector,
        });

        /* istanbul ignore else  */
        if (process.env.NODE_ENV !== 'production') {
            /* istanbul ignore else  */
            if (isDebugMode()) {
                defineDynamicSelectorName(higherOrderSelector, () => {
                    const baseName = getSelectorName(selector);

                    return `higher order for ${baseName} (${stringifyFunction(fn)})`;
                });
            }
        }

        type CombineSelector = ParametricSelector<S1 & S2, P1 & P2, R1 & R2> & {
            dependencies: any;
            cache: ICacheObject;
            keySelector?: KeySelector<S1 & S2>;
        };

        const combinedSelector: CombineSelector = (state: S1 & S2, props: P1 & P2): R1 & R2 => {
            const derivedSelector = higherOrderSelector(state, props);

            combinedSelector.dependencies = [higherOrderSelector, derivedSelector];

            /* istanbul ignore else  */
            if (process.env.NODE_ENV !== 'production') {
                /* istanbul ignore else  */
                if (isDebugMode()) {
                    const derivedSelectorName = getSelectorName(derivedSelector);

                    if (!derivedSelectorName) {
                        defineDynamicSelectorName(derivedSelector, () => {
                            const baseName = getSelectorName(selector);
                            const derivedSelectorKey = generateSelectorKey(derivedSelector);

                            return `derived from ${baseName} (${derivedSelectorKey})`;
                        });
                    }

                    defineDynamicSelectorName(combinedSelector, () => {
                        const baseName = getSelectorName(selector);
                        const dependencyName = getSelectorName(derivedSelector);

                        return `${baseName} (chained by ${dependencyName})`;
                    });
                }
            }

            return derivedSelector(state, props) as any;
        };

        combinedSelector.dependencies = [
            higherOrderSelector
        ];
        combinedSelector.cache = higherOrderSelector.cache;

        const higherOrderKeySelector = createCachedSelector(
            [
                higherOrderSelector
            ],
            derivedSelector => {
                return keySelectorCreator({
                    inputSelectors: [higherOrderSelector, derivedSelector],
                });
            },
        )({
            ...createSelectorOptions(),
            keySelector,
        });

        combinedSelector.keySelector = (state: S1 & S2, props: P1 & P2) => {
            const derivedKeySelector = higherOrderKeySelector(state, props);
            return derivedKeySelector(state, props);
        };

        /* istanbul ignore else  */
        if (process.env.NODE_ENV !== 'production') {
            /* istanbul ignore else  */
            if (isDebugMode()) {
                defineDynamicSelectorName(combinedSelector, () => {
                    const baseName = getSelectorName(selector);

                    return `${baseName} (will be chained ${stringifyFunction(fn)})`;
                });
            }
        }

        const nextPrevChain = Object.assign(fn, {
            parentChain: prevChain,
        });

        return createChainSelector<S1 & S2, P1 & P2, R1 & R2>(
            combinedSelector, combinedOptions, nextPrevChain
        );
    };

    const map = <R2>(fn: (result: R1) => R2, mapOptions?: ChainSelectorOptions) => {
        const mapSelector = (result: R1) => {
            const output = fn(result);
            const mapSelector = () => output;

            /* istanbul ignore else  */
            if (process.env.NODE_ENV !== 'production') {
                /* istanbul ignore else  */
                if (isDebugMode()) {
                    defineDynamicSelectorName(mapSelector, () => {
                        const baseName = getSelectorName(selector);

                        return `mapped from ${baseName} (${stringifyFunction(fn)})`;
                    });
                }
            }

            return mapSelector;
        };

        return chain(mapSelector, mapOptions);
    };

    const build = () => {
        return Object.assign(selector, {
            chainHierarchy: prevChain,
        });
    };

    return {
        chain,
        map,
        build,
    };
}
