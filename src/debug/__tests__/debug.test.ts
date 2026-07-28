import { afterEach, describe, expect, test } from 'vitest';
import { isDebugMode, setDebugMode } from '../debug';

describe('debug mode', () => {
  afterEach(() => {
    setDebugMode(false);
  });

  test('is disabled by default', () => {
    expect(isDebugMode()).toBe(false);
  });

  test('reflects the value set via setDebugMode', () => {
    setDebugMode(true);
    expect(isDebugMode()).toBe(true);

    setDebugMode(false);
    expect(isDebugMode()).toBe(false);
  });
});
