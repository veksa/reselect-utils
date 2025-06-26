import { getObjectPaths } from '../getObjectPaths';

describe('getObjectPaths', () => {
  test('should extract keys from object', () => {
    const obj = {
      key1: 1,
      key2: 'sting',
      key3: true,
      key4: undefined,
      key5: null,
    };

    const actual = getObjectPaths(obj);

    expect(actual).toEqual([['key1'], ['key2'], ['key3'], ['key4'], ['key5']]);
  });

  test('should extract keys from nested object', () => {
    const obj = {
      key1: {
        key2: {
          key3: undefined,
        },
        key4: {
          key5: 1,
        },
        key6: {
          key7: 'sting',
          key8: null,
        },
      },
    };

    const actual = getObjectPaths(obj);

    expect(actual).toEqual([
      ['key1', 'key2', 'key3'],
      ['key1', 'key4', 'key5'],
      ['key1', 'key6', 'key7'],
      ['key1', 'key6', 'key8'],
    ]);
  });

  test('should work with array', () => {
    const obj = {
      key1: [{ key2: { key3: [1] } }, 2],
    };

    const actual = getObjectPaths(obj);

    expect(actual).toEqual([
      ['key1', '0', 'key2', 'key3', '0'],
      ['key1', '1'],
    ]);
  });
});
