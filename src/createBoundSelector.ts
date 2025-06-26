import { ParametricSelector } from '@veksa/re-reselect';
import {
  CachedSelector,
  NamedParametricSelector,
  NamedSelector,
} from './types';
import {
  getSelectorName,
  isDebugMode,
  isCachedSelector,
  defineDynamicSelectorName,
  defaultKeySelector,
  isObject,
  arePathsEqual,
  getObjectPaths,
} from './helpers';
import {
  isComposedKeySelector,
  KeySelectorComposer,
} from './createKeySelectorComposer';
import { isPropSelector } from './createPropSelector';
import { excludeDefaultSelectors } from './createKeySelectorCreator';
import { stringComposeKeySelectors } from './stringComposeKeySelectors';
import { temporaryAssign } from './_helpers/temporaryAssign';

const generateBindingName = <P extends object>(binding: P) => {
  const structure = Object.keys(binding).reduce(
    (result, key) => ({
      ...result,
      [key]: '[*]',
    }),
    {},
  );
  const structureKeys = Object.keys(structure).join();
  const structureValues = Object.values(structure).join();

  return `${structureKeys} -> ${structureValues}`;
};

/**
 * The special type to prevent binding of non optional props on optional values
 */
export type BoundSelector<S, P2, P1 extends Partial<P2>, R> = P2 extends Pick<
  P1,
  keyof P2
>
  ? Exclude<keyof P1, keyof P2> extends never
    ? NamedSelector<S, R>
    : NamedParametricSelector<S, Omit<P1, keyof P2>, R>
  : never;

export type BoundSelectorOptions<S, P2, P1 extends Partial<P2>, R> = {
  bindingStrategy?: (
    baseSelector: ParametricSelector<S, P1, R>,
    binding: P2,
  ) => ParametricSelector<S, Omit<P1, keyof P2>, R>;
  keySelectorComposer?: KeySelectorComposer;
};

const innerCreateBoundSelector = <S, P2, P1 extends Partial<P2>, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  binding: P2,
) => {
  const boundSelector = (state: S, props: Omit<P1, keyof P2> | void) =>
    baseSelector(state, ({
      ...props,
      ...binding,
    } as unknown) as P1);

  return boundSelector as BoundSelector<S, P2, P1, R>;
};

const createBoundInnerSelector = <
  S,
  P2 extends object,
  P1 extends Partial<P2>,
  R,
  OR extends R
>(
  baseSelector: ParametricSelector<S, P1, R>,
  binding: P2,
  options: BoundSelectorOptions<S, P2, P1, OR> = {},
): BoundSelector<S, P2, P1, R> => {
  const bindingStrategy =
    (options.bindingStrategy as typeof innerCreateBoundSelector) ??
    innerCreateBoundSelector;

  const keySelectorComposer =
    options.keySelectorComposer ?? stringComposeKeySelectors;

  const boundSelector = bindingStrategy(baseSelector, binding);

  Object.assign(boundSelector, baseSelector);
  boundSelector.dependencies = [baseSelector];

  /* istanbul ignore else  */
  if (process.env.NODE_ENV !== 'production') {
    /* istanbul ignore else  */
    if (isDebugMode()) {
      defineDynamicSelectorName(boundSelector, () => {
        const baseName = getSelectorName(baseSelector);
        const bindingName = generateBindingName(binding);

        return `${baseName} (${bindingName})`;
      });
    }
  }

  if (isCachedSelector(baseSelector)) {
    const cachedBoundSelector = (boundSelector as unknown) as CachedSelector;

    if (baseSelector.getMatchingSelector) {
      cachedBoundSelector.getMatchingSelector = bindingStrategy(
        baseSelector.getMatchingSelector,
        binding,
      );
    }

    if (baseSelector.removeMatchingSelector) {
      cachedBoundSelector.removeMatchingSelector = bindingStrategy(
        baseSelector.removeMatchingSelector,
        binding,
      );
    }

    const baseKeySelector = baseSelector.keySelector;

    if (isObject(binding)) {
      const paths = getObjectPaths(binding);
      let keySelectors = isComposedKeySelector(baseKeySelector)
        ? baseKeySelector.dependencies
        : [baseKeySelector];

      keySelectors = excludeDefaultSelectors(keySelectors);

      keySelectors = keySelectors
        .filter(
          (keySelector) =>
            !isPropSelector(keySelector) ||
            !paths.some((path) => arePathsEqual(keySelector.path, path)),
        )
        .map((keySelector) =>
          isPropSelector(keySelector)
            ? keySelector
            : bindingStrategy(keySelector, binding),
        );

      if (keySelectors.length === 0) {
        cachedBoundSelector.keySelector = defaultKeySelector;
      } else if (keySelectors.length === 1) {
        const [keySelector] = keySelectors;
        cachedBoundSelector.keySelector = keySelector;
      } else {
        cachedBoundSelector.keySelector = keySelectorComposer(...keySelectors);
      }
    } else {
      cachedBoundSelector.keySelector = bindingStrategy(
        baseKeySelector,
        binding,
      );
    }
  }

  return boundSelector;
};

export const createBoundSelector: typeof createBoundInnerSelector = (baseSelector, binding) => {
  return createBoundInnerSelector(baseSelector, binding, {
    bindingStrategy: (selector, bindingProps) => {
      return (state, props) => {
        const {result: nextProps, rollback} = temporaryAssign(props, bindingProps as Record<string, unknown>);
        const result = selector(state, nextProps as Parameters<typeof baseSelector>[1]);
        rollback();
        return result;
      };
    },
  });
};
