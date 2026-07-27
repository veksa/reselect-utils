import { expectTypeOf } from 'expect-type';
import { isDebugMode, setDebugMode } from '../src/index';

// the debug flag getter/setter have simple boolean signatures
expectTypeOf(isDebugMode).toEqualTypeOf<() => boolean>();
expectTypeOf(setDebugMode).toEqualTypeOf<(value: boolean) => void>();

// the setter only accepts a boolean
// @ts-expect-error - a string is not a valid debug flag
setDebugMode('true');
