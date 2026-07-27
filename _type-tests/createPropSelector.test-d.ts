import { expectTypeOf } from 'expect-type';
import { createPropSelector } from '../src/index';

type Props = {
  userId: number;
  range?: {
    from?: number;
    to?: number;
  };
};

const propSelector = createPropSelector<Props>();

// required prop is selected with its exact type
const userIdSelector = propSelector.userId();
expectTypeOf(userIdSelector({}, { userId: 1 })).toEqualTypeOf<number>();

// nested optional props are selected as their defined (non-nullable) type
const fromSelector = propSelector.range.from();
expectTypeOf(fromSelector({}, { userId: 1 })).toEqualTypeOf<number>();

// a default value can be provided for optional props
const fromWithDefaultSelector = propSelector.range.from(0);
expectTypeOf(fromWithDefaultSelector({}, { userId: 1 })).toEqualTypeOf<number>();
