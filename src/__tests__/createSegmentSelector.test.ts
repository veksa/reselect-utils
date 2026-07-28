import { describe, expect, test } from 'vitest';
import { createSegmentSelector } from '../createSegmentSelector';

describe('createSegmentSelector', () => {
  type State = { value?: number | null; nested: { count: number } };

  test('returns the selected segment when it is present', () => {
    const selector = createSegmentSelector((state: State) => state.nested, { count: 0 });

    const state: State = { nested: { count: 5 } };
    expect(selector(state)).toBe(state.nested);
  });

  test('falls back to the initial value when the segment is undefined', () => {
    const selector = createSegmentSelector((state: State) => state.value, 42);

    expect(selector({ value: undefined, nested: { count: 0 } })).toBe(42);
  });

  test('falls back to the initial value when the segment is null', () => {
    const selector = createSegmentSelector((state: State) => state.value, 42);

    expect(selector({ value: null, nested: { count: 0 } })).toBe(42);
  });

  test('does not fall back for defined but falsy values', () => {
    const selector = createSegmentSelector((state: State) => state.value, 42);

    expect(selector({ value: 0, nested: { count: 0 } })).toBe(0);
  });
});
