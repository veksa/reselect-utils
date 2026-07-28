import { defineDynamicSelectorName } from '../_helpers/defineDynamicSelectorName';
import { isDebugMode } from './debug';

/**
 * Runs `callback` only outside production and only while debug mode is enabled.
 * Centralizes the `NODE_ENV` / `isDebugMode` guard that the selector factories
 * would otherwise repeat around every debug-name assignment.
 */
export const runInDebug = (callback: () => void) => {
  /* istanbul ignore else  */
  if (process.env.NODE_ENV !== 'production') {
    /* istanbul ignore else  */
    if (isDebugMode()) {
      callback();
    }
  }
};

/**
 * Assigns a lazily-computed debug name to `selector`, guarded by
 * {@link runInDebug}. Covers the common single-name case; use `runInDebug`
 * directly when a block needs to name several selectors at once.
 */
export const withDebugName = (selector: unknown, selectorNameGetter: () => string) => {
  runInDebug(() => {
    defineDynamicSelectorName(selector, selectorNameGetter);
  });
};
