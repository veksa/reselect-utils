import { useRef } from 'react';

export const useMemoWith = <T>(value: T, comparator: (a: T, b: T) => boolean) => {
  const ref = useRef<T>(value);

  if (!comparator(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
};
