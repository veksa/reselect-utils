/**
 * TEMPORARY vendored surface mirroring the modernized `re-reselect` (PR #484).
 * The installed `@veksa/re-reselect@5.1.1-p8` still ships the legacy
 * split/overload types (`Selector` / `ParametricSelector` + per-arity
 * overloads), so until that fork is bumped to the unified build we re-type its
 * runtime exports here against reselect v5's variadic-tuple model.
 *
 * The runtime (`createCachedSelector`, cache objects) is byte-for-byte the same
 * API as the modern build, so re-typing the legacy exports is sound.
 *
 * TODO(after @veksa/re-reselect bump): delete this file and switch imports of
 * `./_reReselect` back to `@veksa/re-reselect`.
 */
import {
  createCachedSelector as legacyCreateCachedSelector,
  FlatObjectCache as legacyFlatObjectCache,
  FlatMapCache as legacyFlatMapCache,
} from '@veksa/re-reselect';
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

export const createCachedSelector = legacyCreateCachedSelector as unknown as CreateCachedSelector;

export const FlatObjectCache = legacyFlatObjectCache;
export const FlatMapCache = legacyFlatMapCache;
