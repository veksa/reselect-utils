import {ParametricSelector} from '@veksa/re-reselect';
import {innerCreatePathSelector, RequiredPathParametricSelectorType,} from './createPathSelector';
import {Path} from './types';

const propSelectorSymbol = Symbol.for('PropSelector');

export const isPropSelector = (selector: unknown): selector is { path: Path } => {
    return selector instanceof Object && propSelectorSymbol in selector;
};

export function createPropSelector<P>(): RequiredPathParametricSelectorType<unknown, P, P, [ParametricSelector<unknown, P, P>]> {
    const propsSelector = (state: unknown, props: unknown) => props;

    const applyMeta = (selector: unknown) => {
        Object.defineProperty(selector, propSelectorSymbol, {value: true});
    };

    return innerCreatePathSelector(propsSelector, [], applyMeta) as RequiredPathParametricSelectorType<unknown, P, P, [ParametricSelector<unknown, P, P>]>;
}
