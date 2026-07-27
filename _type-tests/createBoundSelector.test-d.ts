import { expectTypeOf } from 'expect-type';
import { Selector, ParametricSelector } from '@veksa/re-reselect';
import { createBoundSelector } from '../src/index';
import { Person, State } from './models';

const stateFixture: State = {
  persons: { data: {} },
  messages: { data: {} },
};

const personSelector = (
  state: State,
  props: { personId: number },
): Person | undefined => state.persons.data[props.personId];

// binding every prop turns the selector into a plain one
const boundSelector = createBoundSelector(personSelector, { personId: 1 });

expectTypeOf(boundSelector).toExtend<Selector<State, Person | undefined>>();
expectTypeOf(boundSelector(stateFixture)).toEqualTypeOf<Person | undefined>();

// binding a subset of props keeps the selector parametric with the rest
const twoPropsSelector = (
  state: State,
  props: { personId: number; messageId: number },
): Person | undefined => state.persons.data[props.personId];

const partiallyBoundSelector = createBoundSelector(twoPropsSelector, {
  personId: 1,
});

expectTypeOf(partiallyBoundSelector).toExtend<
  ParametricSelector<State, { messageId: number }, Person | undefined>
>();
expectTypeOf(
  partiallyBoundSelector(stateFixture, { messageId: 100 }),
).toEqualTypeOf<Person | undefined>();

// a custom binding options object is accepted
const boundWithOptions = createBoundSelector(
  personSelector,
  { personId: 1 },
  {
    keySelectorComposer: undefined,
  },
);
expectTypeOf(boundWithOptions(stateFixture)).toEqualTypeOf<Person | undefined>();

// the binding must be a subset of the selector props
// @ts-expect-error - `unknownProp` is not a prop of the selector
createBoundSelector(personSelector, { unknownProp: 1 });
