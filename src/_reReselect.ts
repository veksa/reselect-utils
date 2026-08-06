/**
 * TEMPORARY vendored surface mirroring the modernized `re-reselect` (PR #484).
 * The installed `@veksa/re-reselect@5.1.1-p8` still ships the legacy
 * split/overload types (`Selector` / `ParametricSelector` + per-arity
 * overloads), so until that fork is bumped to the unified build we re-type its
 * runtime exports here against reselect v5's variadic-tuple model.
 *
 * The runtime is vendored too, not only the types. The published build's hot path
 * allocates a rest array and a destructured copy of it on every call, spreads both
 * back at two call sites, detaches `isValidCacheKey` from its cache so a validator
 * reading `this` throws, and lets each memoized instance keep a `weakMapMemoize`
 * cache over `(state, props)` — which, since a store replaces the state on every
 * write, misses on every call and allocates a node to record the miss. Together
 * those cost about half of every call. The implementation below is the same one
 * upstream carries, with none of that; the public API and behaviour are unchanged
 * apart from the argument-cache default, which a caller can still override.
 *
 * TODO(after @veksa/re-reselect bump): delete this file and switch imports of
 * `./_reReselect` back to `@veksa/re-reselect`.
 */
import {
  FlatObjectCache as legacyFlatObjectCache,
  FlatMapCache as legacyFlatMapCache,
} from '@veksa/re-reselect';
import { createSelector, lruMemoize } from '@veksa/reselect';
import type {
  Combiner,
  CreateSelectorFunction,
  CreateSelectorOptions,
  GetParamsFromSelectors,
  GetStateFromSelectors,
  OutputSelector,
  SelectorArray,
} from '@veksa/reselect';

/**
 * A cache store used by `createCachedSelector` to memoize selector instances by
 * cache key.
 */
export interface ICacheObject {
  set(key: any, selectorFn: any): void;
  get(key: any): any;
  remove(key: any): void;
  clear(): void;
  isValidCacheKey?(key: any): boolean;
}

/**
 * A function which takes the same arguments as the selector and returns a
 * cacheKey. The cacheKey is used to look up the matching reselect selector in
 * the cache. The key is intentionally untyped (`any`) — this mirrors
 * re-reselect's own design where the cache key can be any hashable value.
 */
export type KeySelector<S> = (state: S, ...args: any[]) => any;

/**
 * `keySelector` type with parameters inferred from the parent selector's input
 * selectors. Used to give precise types to the user-supplied keySelector
 * callback at call sites.
 */
export type TypedKeySelector<InputSelectors extends SelectorArray> = (
  state: GetStateFromSelectors<InputSelectors>,
  ...params: GetParamsFromSelectors<InputSelectors>
) => unknown;

/**
 * A function which receives the selector's inputSelectors/resultFunc/keySelector
 * and returns the keySelector to be used at runtime.
 */
export type KeySelectorCreator<InputSelectors extends SelectorArray, Result> = (selectorInputs: {
  inputSelectors: InputSelectors;
  resultFunc: Combiner<InputSelectors, Result>;
  keySelector?: TypedKeySelector<InputSelectors>;
}) => TypedKeySelector<InputSelectors>;

export type CreateCachedSelectorOptions<InputSelectors extends SelectorArray, Result> = {
  keySelector?: TypedKeySelector<InputSelectors>;
  cacheObject?: ICacheObject;
  selectorCreator?: CreateSelectorFunction<any, any, any>;
  keySelectorCreator?: KeySelectorCreator<InputSelectors, Result>;
};

/**
 * The selector instance returned by `createCachedSelector(...)(...)`. Extends
 * reselect's `OutputSelector` with cache-management methods.
 *
 * `.keySelector` is exposed using the loose `KeySelector<State>` shape rather
 * than the precise `TypedKeySelector<InputSelectors>` for back-compat with
 * consumers that test the type against `KeySelector<State>`.
 */
export type OutputCachedSelector<InputSelectors extends SelectorArray, Result> = OutputSelector<
  InputSelectors,
  Result
> & {
  getMatchingSelector: (
    ...args: Parameters<OutputSelector<InputSelectors, Result>>
  ) => OutputSelector<InputSelectors, Result>;
  removeMatchingSelector: (...args: Parameters<OutputSelector<InputSelectors, Result>>) => void;
  clearCache: () => void;
  cache: ICacheObject;
  keySelector: KeySelector<GetStateFromSelectors<InputSelectors>>;
};

/**
 * The curried second-call argument: a `keySelector` function or an options
 * object.
 */
export type PolymorphicCachedOptions<InputSelectors extends SelectorArray, Result> =
  | TypedKeySelector<InputSelectors>
  | CreateCachedSelectorOptions<InputSelectors, Result>;

/**
 * Just the callable signatures of `createCachedSelector`, without `withTypes`.
 *
 * Three overloads (variadic, variadic+options, array+options) using tuple
 * inference instead of per-arity overload duplication, mirroring reselect's
 * `CreateSelectorFunction` pattern.
 */
export interface CreateCachedSelectorImpl<StateType = any> {
  <InputSelectors extends SelectorArray<StateType>, Result>(
    ...createSelectorArgs: [
      ...inputSelectors: InputSelectors,
      combiner: Combiner<InputSelectors, Result>,
    ]
  ): (
    polymorphicOptions: PolymorphicCachedOptions<InputSelectors, Result>,
  ) => OutputCachedSelector<InputSelectors, Result>;

  <InputSelectors extends SelectorArray<StateType>, Result>(
    ...createSelectorArgs: [
      ...inputSelectors: InputSelectors,
      combiner: Combiner<InputSelectors, Result>,
      createSelectorOptions: CreateSelectorOptions,
    ]
  ): (
    polymorphicOptions: PolymorphicCachedOptions<InputSelectors, Result>,
  ) => OutputCachedSelector<InputSelectors, Result>;

  <InputSelectors extends SelectorArray<StateType>, Result>(
    inputSelectors: [...InputSelectors],
    combiner: Combiner<InputSelectors, Result>,
    createSelectorOptions?: CreateSelectorOptions,
  ): (
    polymorphicOptions: PolymorphicCachedOptions<InputSelectors, Result>,
  ) => OutputCachedSelector<InputSelectors, Result>;
}

/**
 * The full `createCachedSelector` surface: callable signatures plus the
 * `withTypes` helper for pre-typing the state.
 */
export interface CreateCachedSelector<StateType = any> extends CreateCachedSelectorImpl<StateType> {
  withTypes: <OverrideStateType extends StateType>() => CreateCachedSelector<OverrideStateType>;
}

type UnknownFunction = (...args: readonly unknown[]) => unknown;

function isFunction(value: unknown): value is UnknownFunction {
  return typeof value === 'function';
}

/**
 * Walk the args from the right: the last one is either the combiner or
 * `createSelectorOptions`, and in the latter case the combiner sits before it.
 * Whatever remains is the input selectors, spread or wrapped in a single array.
 */
function parseReselectArgs(reselectArgs: readonly unknown[]) {
  const args = [...reselectArgs];
  const last = args.pop();

  let resultFunc: unknown;
  let createSelectorOptions: unknown;

  if (isFunction(last)) {
    resultFunc = last;
  } else {
    resultFunc = args.pop();
    createSelectorOptions = last;
  }

  const inputSelectors = (Array.isArray(args[0]) ? args[0] : args) as SelectorArray;

  return {
    inputSelectors,
    resultFunc: resultFunc as Combiner<SelectorArray, unknown>,
    createSelectorOptions: createSelectorOptions as CreateSelectorOptions | undefined,
  };
}

const createCachedSelectorImpl = (...reselectArgs: readonly unknown[]): unknown => {
  const { inputSelectors, resultFunc, createSelectorOptions } = parseReselectArgs(reselectArgs);

  return (polymorphicOptions: unknown) => {
    const options = (
      isFunction(polymorphicOptions) ? { keySelector: polymorphicOptions } : polymorphicOptions
    ) as CreateCachedSelectorOptions<SelectorArray, unknown> & {
      keySelector?: UnknownFunction;
    };

    let recomputations = 0;
    const resultFuncWithRecomputations: UnknownFunction = (...args) => {
      recomputations += 1;
      return (resultFunc as UnknownFunction)(...args);
    };

    /**
     * Instances default to a size-1 argument cache rather than `weakMapMemoize`.
     * The instance has already been chosen by cache key, so it sees one argument
     * shape and needs no cache of its own beyond the previous call. What makes a
     * result reusable is the memoization on *input values* below it, which is
     * untouched. Caller options are spread last, so an explicit `argsMemoize` wins.
     */
    const patchedReselectArgs: unknown[] = [
      inputSelectors,
      resultFuncWithRecomputations,
      { argsMemoize: lruMemoize, ...createSelectorOptions },
    ];

    const cache: ICacheObject = options.cacheObject ?? new legacyFlatObjectCache();
    const selectorCreator = (options.selectorCreator ?? createSelector) as UnknownFunction;

    if (options.keySelectorCreator) {
      options.keySelector = options.keySelectorCreator({
        keySelector: options.keySelector as never,
        inputSelectors,
        resultFunc,
      }) as UnknownFunction;
    }

    const keySelector = options.keySelector as UnknownFunction;

    /**
     * Selectors are reached as `(state)` or `(state, props)` in all but exotic
     * cases, and those two arities are dispatched directly. A rest parameter
     * allocates an array on every call and forwarding it costs a spread at each of
     * the two call sites below — all of it paid on a cache hit, which is what the
     * overwhelming majority of calls are. The arity is matched exactly rather than
     * always forwarding two arguments, because reselect memoizes on the argument
     * list and a stray `undefined` would change the key.
     */
    function selector(state: unknown, props?: unknown): unknown {
      const argumentCount = arguments.length;

      const cacheKey =
        argumentCount === 2
          ? keySelector(state, props)
          : argumentCount === 1
            ? keySelector(state)
            : keySelector.apply(null, arguments as unknown as unknown[]);

      // Invoked as a method on the cache rather than through a detached reference,
      // so an implementation whose validator reads `this` — `TreeCache` consulting
      // its own root — is callable at all.
      if (cache.isValidCacheKey !== undefined && !cache.isValidCacheKey(cacheKey)) {
        // eslint-disable-next-line no-console
        console.warn(
          `[re-reselect] Invalid cache key "${String(
            cacheKey,
          )}" has been returned by keySelector function.`,
        );
        return undefined;
      }

      let cacheResponse: UnknownFunction | undefined = cache.get(cacheKey);

      if (!cacheResponse) {
        cacheResponse = selectorCreator(...patchedReselectArgs) as UnknownFunction;
        cache.set(cacheKey, cacheResponse);
      }

      return argumentCount === 2
        ? cacheResponse(state, props)
        : argumentCount === 1
          ? cacheResponse(state)
          : cacheResponse.apply(null, arguments as unknown as unknown[]);
    }

    return Object.assign(selector, {
      getMatchingSelector: (...args: readonly unknown[]) => cache.get(keySelector(...args)),
      removeMatchingSelector: (...args: readonly unknown[]) => {
        cache.remove(keySelector(...args));
      },
      clearCache: () => {
        cache.clear();
      },
      resultFunc,
      dependencies: inputSelectors,
      cache,
      recomputations: () => recomputations,
      resetRecomputations: () => {
        recomputations = 0;
      },
      keySelector: options.keySelector,
    });
  };
};

export const createCachedSelector = Object.assign(createCachedSelectorImpl, {
  withTypes: () => createCachedSelector,
}) as unknown as CreateCachedSelector;

export const FlatObjectCache = legacyFlatObjectCache;
export const FlatMapCache = legacyFlatMapCache;
