import { CachedSelector } from '../types';

export const isCachedSelector = (selector: unknown): selector is CachedSelector => {
  return selector instanceof Object && 'keySelector' in selector;
};
