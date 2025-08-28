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

export type SelectorChain<R1, S1, R2> = (result: R1) => Selector<S1, R2>;

export type ParametricSelectorChain<R1, S1, P1, R2> = (result: R1) => ParametricSelector<S1, P1, R2>;

export type SelectorChainHierarchy<
    C extends SelectorChain<any, any, any>,
    H extends SelectorChainHierarchy<any, any>
> = C & { parentChain?: H };

export type ParametricSelectorChainHierarchy<
    C extends ParametricSelectorChain<any, any, any, any>,
    H extends ParametricSelectorChainHierarchy<any, any>
> = C & { parentChain?: H };

export type CreateSelectorOptions<SelectorCreator extends typeof createSelectorCreator> = {
    selectorCreator: ReturnType<SelectorCreator>;
    cacheObject: ICacheObject,
}

export type ChainSelectorOptions<SelectorCreator extends typeof createSelectorCreator = typeof createSelectorCreator> = {
    createSelectorOptions?: () => CreateSelectorOptions<SelectorCreator>;
    keySelectorComposer?: KeySelectorComposer;
};

interface ChainSelectorResult<S1, R1> {
    chain: <S2, R2 = any>(fn: SelectorChain<R1, S2, R2>, chainOptions?: ChainSelectorOptions) => ChainSelectorResult<S1 & S2, R2>;
    map: <R2>(fn: (result: R1) => R2, mapOptions?: ChainSelectorOptions) => ChainSelectorResult<S1, R2>;
    build: () => Selector<S1, R1> & {
        chainHierarchy: SelectorChainHierarchy<any, any> | undefined
    };
}

interface ParametricChainSelectorResult<S1, P1, R1> {
    chain: <S2, P2 = unknown, R2 = any>(fn: ParametricSelectorChain<R1, S2, P2, R2>, chainOptions?: ChainSelectorOptions) => ParametricChainSelectorResult<S1 & S2, P1 & P2, R2>;
    map: <R2>(fn: (result: R1) => R2, mapOptions?: ChainSelectorOptions) => ParametricChainSelectorResult<S1, P1, R2>;
    build: () => ParametricSelector<S1, P1, R1> & {
        chainHierarchy: ParametricSelectorChainHierarchy<any, any> | undefined
    };
}

export function createChainSelector<S1, R1>(
    selector: Selector<S1, R1>,
    options?: ChainSelectorOptions,
    prevChain?: SelectorChainHierarchy<any, any>
): ChainSelectorResult<S1, R1>;

export function createChainSelector<S1, P1, R1>(
    selector: ParametricSelector<S1, P1, R1>,
    options?: ChainSelectorOptions,
    prevChain?: ParametricSelectorChainHierarchy<any, any>
): ParametricChainSelectorResult<S1, P1, R1>;

export function createChainSelector<S1, P1, R1>(
    selector: any,
    options?: ChainSelectorOptions,
    prevChain?: any
): any {
    const chain = <S2, P2, R2>(fn: any, chainOptions?: ChainSelectorOptions) => {
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
            const derivedSelector: any = (higherOrderSelector as any)(state, props);

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

            return derivedSelector(state, props);
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
            const derivedKeySelector = (higherOrderKeySelector as any)(state, props);
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
