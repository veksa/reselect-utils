import {temporaryAssign} from '../temporaryAssign';

describe('temporaryAssign', () => {
  test('should delete field if it was not in target object', () => {
    const target = {
      field1: 'some value',
    };
    const source = {
      field1: 'another value',
      field2: 'second value',
    };

    const {rollback} = temporaryAssign(target, source);

    const expected = {
      field1: 'another value',
      field2: 'second value',
    };

    expect(target).toEqual(expected);

    rollback();

    const rollbackExpected = {
      field1: 'some value',
    };

    expect(target).toEqual(rollbackExpected);
  });

  test('should set undefined field if field was undefined in target object', () => {
    const target = {
      field1: 'some value',
      field2: undefined,
    } as Record<string, unknown>;
    const source = {
      field1: 'another value',
      field2: 'second value',
    };

    const {rollback} = temporaryAssign(target, source);

    const expected = {
      field1: 'another value',
      field2: 'second value',
    };

    expect(target).toEqual(expected);

    rollback();

    const rollbackExpected = {
      field1: 'some value',
      field2: undefined,
    } as Record<string, unknown>;

    expect(target).toEqual(rollbackExpected);
  });
});
