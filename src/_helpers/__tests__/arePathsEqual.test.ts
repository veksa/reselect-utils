import { arePathsEqual } from '../arePathsEqual';

describe('arePathsEqual', () => {
  test('should return false if paths have different length', () => {
    const path = ['first', 'second'];
    const anotherPath = ['123'];

    const actual = arePathsEqual(path, anotherPath);
    expect(actual).toBeFalsy();
  });

  test('should return false if paths have different elements', () => {
    const path = ['first', 'second'];
    const anotherPath = ['first', 'third'];

    const actual = arePathsEqual(path, anotherPath);
    expect(actual).toBeFalsy();
  });

  test('should return true if paths have equal elements', () => {
    const path = ['first', 'second'];
    const anotherPath = ['first', 'second'];

    const actual = arePathsEqual(path, anotherPath);
    expect(actual).toBeTruthy();
  });
});
