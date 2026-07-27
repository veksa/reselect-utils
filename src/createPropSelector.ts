import { Selector } from '@veksa/reselect';
import { innerCreatePathSelector, RequiredPathParametricSelectorType } from './createPathSelector';
import { Path } from './types';

const propSelectorSymbol = Symbol.for('PropSelector');

export const isPropSelector = (selector: unknown): selector is { path: Path } => {
  return selector instanceof Object && propSelectorSymbol in selector;
};

export function createPropSelector<P>(): RequiredPathParametricSelectorType<
  unknown,
  P,
  P,
  [Selector<unknown, P, [P]>]
> {
  const propsSelector = (_state: unknown, props: unknown) => props;

  const applyMeta = (selector: unknown) => {
    Object.defineProperty(selector, propSelectorSymbol, { value: true });
  };

  return innerCreatePathSelector(
    propsSelector,
    [],
    applyMeta,
  ) as RequiredPathParametricSelectorType<unknown, P, P, [Selector<unknown, P, [P]>]>;
}
