import {stringifyFunction} from "./stringifyFunction";

export const generateSelectorKey = (selector: unknown) => {
    const dependencies = (selector as { dependencies?: unknown[] }).dependencies ?? [];

    let result = stringifyFunction(selector);

    for (let i = dependencies.length - 1; i >= 0; i -= 1) {
        const dependency = dependencies[i];

        result += stringifyFunction(dependency);
    }

    return result;
};
