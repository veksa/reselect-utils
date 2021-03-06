import { KeySelector, ParametricKeySelector } from 're-reselect';
import { isCachedSelector } from './helpers';
import { composeKeySelectors } from './composeKeySelectors';

export function composingKeySelectorCreator<S, D>(selectorInputs: {
  inputSelectors: D;
  keySelector?: KeySelector<S>;
}): KeySelector<S>;

export function composingKeySelectorCreator<S, P, D>(selectorInputs: {
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
    if (isCachedSelector(selector)) {
      keySelectorSet.add(selector.keySelector);
    }
  });

  const keySelectors = [...keySelectorSet];

  if (keySelectors.length === 0) {
    return () => '<DefaultKey>';
  }

  if (keySelectors.length === 1) {
    const [resultSelector] = keySelectors;
    return resultSelector;
  }

  return composeKeySelectors(...keySelectors);
}
