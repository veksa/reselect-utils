import { KeySelector, ParametricKeySelector } from 're-reselect';
import { tryExtractCachedSelector } from './helpers';

export function composingKeySelectorCreator<S, C, D>(selectorInputs: {
  inputSelectors: D;
  keySelector?: KeySelector<S>;
}): KeySelector<S>;

export function composingKeySelectorCreator<S, P, C, D>(selectorInputs: {
  inputSelectors: D;
  keySelector?: ParametricKeySelector<S, P>;
}): ParametricKeySelector<S, P>;

export function composingKeySelectorCreator({
  inputSelectors,
  keySelector,
}: any) {
  const keySelectorSet = new Set<any>();

  if (keySelector) {
    keySelectorSet.add(keySelector);
  }

  inputSelectors.forEach((selector: any) => {
    const cachedSelector = tryExtractCachedSelector(selector);
    if (cachedSelector) {
      keySelectorSet.add(cachedSelector.keySelector);
    }
  });

  const keySelectors = [...keySelectorSet];

  if (keySelectors.length === 0) {
    throw Error(
      'Cached Selector with Composing Key Selector Creator ' +
        'should have at least one Cached Selector in dependency ' +
        'or own Key Selector',
    );
  }

  if (keySelectors.length === 1) {
    const [resultSelector] = keySelectors;
    return resultSelector;
  }

  return (state: any, props: any) => {
    let key = keySelectors[0](state, props);

    for (let i = 1; i < keySelectors.length; i += 1) {
      key += ':';
      key += keySelectors[i](state, props);
    }

    return key;
  };
}