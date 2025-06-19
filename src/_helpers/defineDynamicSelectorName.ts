export const defineDynamicSelectorName = (
  selector: unknown,
  selectorNameGetter: () => string,
) => {
  let overriddenSelectorName: string;
  Object.defineProperty(selector, 'selectorName', {
    configurable: true,
    get: () => overriddenSelectorName ?? selectorNameGetter(),
    set: (value: string) => {
      overriddenSelectorName = value;
    },
  });
};
