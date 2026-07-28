import { describe, expect, test } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMemoWith } from '../useMemoWith';

describe('useMemoWith', () => {
  const byId = (a: { id: number }, b: { id: number }) => a.id === b.id;

  test('keeps the previous value while the comparator reports equality', () => {
    const { result, rerender } = renderHook(({ value }) => useMemoWith(value, byId), {
      initialProps: { value: { id: 1, tag: 'a' } },
    });

    const first = result.current;
    rerender({ value: { id: 1, tag: 'b' } });

    expect(result.current).toBe(first);
  });

  test('updates the value when the comparator reports inequality', () => {
    const { result, rerender } = renderHook(({ value }) => useMemoWith(value, byId), {
      initialProps: { value: { id: 1 } },
    });

    const first = result.current;
    const next = { id: 2 };
    rerender({ value: next });

    expect(result.current).not.toBe(first);
    expect(result.current).toBe(next);
  });
});
