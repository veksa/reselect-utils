import {ParametricSelector, Selector} from '@veksa/re-reselect';
import {NamedParametricSelector, NamedSelector, Path} from './types';
import {isObject} from './_helpers/isObject';
import {isDebugMode} from './debug/debug';
import {defineDynamicSelectorName} from './_helpers/defineDynamicSelectorName';
import {getSelectorName} from './_helpers/getSelectorName';

export type Defined<T> = Exclude<T, undefined>;

export type IsOptional<T> = undefined extends T
    ? true
    : null extends T
        ? true
        : false;

// eslint-disable-next-line @typescript-eslint/ban-types
export type IsObject<T> = T extends object ? true : false;

export type PathSelector<S, R, D> = NamedSelector<S, R, D> & {
    path: Path;
};

export type PathParametricSelector<S, P, R, D> = NamedParametricSelector<S, P, R, D> & {
    path: Path;
};

type Required<T> = { [P in keyof T]-?: Exclude<T[P], undefined | null> };

export type RequiredSelectorBuilder<S, R, D> = (R extends object ? { [K in keyof R]: () => PathSelector<S, NonNullable<R[K]>, D>; } : {});

export type OptionalSelectorBuilder<S, R, D> =
    ((defaultValue?: R) => PathSelector<S, R extends undefined ? Defined<R> : R, D>)
    & (R extends object ? { [K in keyof Required<R>]: () => PathSelector<S, NonNullable<R[K]>, D>; } : {});

export type RequiredParametricSelectorBuilder<S, P, R, D> =
    (R extends object ? { [K in keyof R]: () => PathParametricSelector<S, P, NonNullable<R[K]>, D>; } : {});

export type OptionalParametricSelectorBuilder<S, P, R, D> =
    ((defaultValue?: R) => PathParametricSelector<S, P, R extends undefined ? Defined<R> : R, D>)
    & (R extends object ? { [K in keyof Required<R>]: () => PathParametricSelector<S, P, NonNullable<R[K]>, D>; } : {});

export type RequiredObjectSelectorWrapper<S, R, D> = {
    [K in keyof R]-?: IsOptional<R[K]> extends true
        ? OptionalPathSelectorType<S, R[K], D>
        : RequiredPathSelectorType<S, R[K], D>;
};

export type OptionalObjectSelectorWrapper<S, R, D> = {
    [K in keyof R]-?: OptionalPathSelectorType<S, R[K], D>;
};

export type RequiredObjectParametricSelectorWrapper<S, P, R, D> = {
    [K in keyof R]-?: IsOptional<R[K]> extends true
        ? OptionalPathParametricSelectorType<S, P, R[K], D>
        : RequiredPathParametricSelectorType<S, P, R[K], D>;
};

export type OptionalObjectParametricSelectorWrapper<S, P, R, D> = {
    [K in keyof R]-?: OptionalPathParametricSelectorType<S, P, R[K], D>;
};

export type RequiredArraySelectorWrapper<S, R, D> = {
    length: RequiredPathSelectorType<S, number, D>;

    [K: number]: IsOptional<R> extends true
        ? OptionalPathSelectorType<S, R, D>
        : RequiredPathSelectorType<S, R, D>;
};

export type OptionalArraySelectorWrapper<S, R, D> = {
    length: RequiredPathSelectorType<S, number, D>;

    [K: number]: OptionalPathSelectorType<S, R, D>;
};

export type RequiredArrayParametricSelectorWrapper<S, P, R, D> = {
    length: RequiredPathParametricSelectorType<S, P, number, D>;

    [K: number]: IsOptional<R> extends true
        ? OptionalPathParametricSelectorType<S, P, R, D>
        : RequiredPathParametricSelectorType<S, P, R, D>;
};

export type OptionalArrayParametricSelectorWrapper<S, P, R, D> = {
    length: RequiredPathParametricSelectorType<S, P, number, D>;

    [K: number]: OptionalPathParametricSelectorType<S, P, R, D>;
};

export type RequiredDataSelectorWrapper<S, R, D> = R extends unknown[]
    ? RequiredArraySelectorWrapper<S, R[number], D>
    : IsObject<R> extends true
        ? RequiredObjectSelectorWrapper<S, R, D>
        : RequiredSelectorBuilder<S, R, D>;

export type OptionalDataSelectorWrapper<S, R, D> = R extends unknown[]
    ? OptionalArraySelectorWrapper<S, R[number], D>
    : IsObject<R> extends true
        ? OptionalObjectSelectorWrapper<S, R, D>
        : OptionalSelectorBuilder<S, R, D>;

export type RequiredDataParametricSelectorWrapper<S, P, R, D> = R extends unknown[]
    ? RequiredArrayParametricSelectorWrapper<S, P, R[number], D>
    : IsObject<R> extends true
        ? RequiredObjectParametricSelectorWrapper<S, P, R, D>
        : RequiredParametricSelectorBuilder<S, P, R, D>;

export type OptionalDataParametricSelectorWrapper<S, P, R, D> = R extends unknown[]
    ? OptionalArrayParametricSelectorWrapper<S, P, R[number], D>
    : IsObject<R> extends true
        ? OptionalObjectParametricSelectorWrapper<S, P, R, D>
        : OptionalParametricSelectorBuilder<S, P, R, D>;

export type RequiredPathSelectorType<S, R, D> = RequiredSelectorBuilder<S, R, D> &
    RequiredDataSelectorWrapper<S, NonNullable<R>, D>;

export type OptionalPathSelectorType<S, R, D> = OptionalSelectorBuilder<S, R, D> &
    OptionalDataSelectorWrapper<S, NonNullable<R>, D>;

export type RequiredPathParametricSelectorType<S, P, R, D> = RequiredParametricSelectorBuilder<S, P, R, D> &
    RequiredDataParametricSelectorWrapper<S, P, NonNullable<R>, D>;

export type OptionalPathParametricSelectorType<S, P, R, D> = OptionalParametricSelectorBuilder<S, P, R, D> &
    OptionalDataParametricSelectorWrapper<S, P, NonNullable<R>, D>;

const defaultVoidFunction = () => {
    return;
}

/** @internal */
export const innerCreatePathSelector = (
    baseSelector: (...args: unknown[]) => unknown,
    path: Path = [],
    applyMeta: (selector: unknown) => void = defaultVoidFunction,
): unknown => {
    const proxyTarget = (defaultValue?: unknown) => {
        function resultSelector() {
            // performance optimisation
            // eslint-disable-next-line prefer-spread
            let result = baseSelector.apply(
                null,
                // eslint-disable-next-line prefer-rest-params
                (arguments as unknown) as unknown[],
            );

            for (let i = 0; i < path.length && isObject(result); i += 1) {
                result = result[path[i]];
            }

            // For optional properties, we want to exclude undefined from the return type
            // but still return undefined if the property doesn't exist
            return result === undefined ? defaultValue : result;
        }

        Object.assign(resultSelector, baseSelector, {path});
        resultSelector.dependencies = [baseSelector];

        applyMeta(resultSelector);

        /* istanbul ignore else  */
        if (process.env.NODE_ENV !== 'production') {
            /* istanbul ignore else  */
            if (isDebugMode()) {
                defineDynamicSelectorName(resultSelector, () => {
                    const baseName = getSelectorName(baseSelector);

                    return [baseName, ...path].join('.');
                });
            }
        }

        return resultSelector;
    };

    return new Proxy(proxyTarget, {
        get: (_target, key) => {
            return innerCreatePathSelector(baseSelector, [...path, String(key)], applyMeta);
        },
    });
};

export function createPathSelector<S, R, P = void>(
    baseSelector: P extends void ? Selector<S, R> : ParametricSelector<S, P, R>
): P extends void
    ? (IsOptional<R> extends true
        ? OptionalPathSelectorType<S, R, [Selector<S, R>]>
        : RequiredPathSelectorType<S, R, [Selector<S, R>]>)
    : (IsOptional<R> extends true
        ? OptionalPathParametricSelectorType<S, P, R, [ParametricSelector<S, P, R>]>
        : RequiredPathParametricSelectorType<S, P, R, [ParametricSelector<S, P, R>]>) {
    return innerCreatePathSelector(baseSelector as (...args: unknown[]) => unknown) as any;
}
