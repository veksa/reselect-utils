import { expectTypeOf } from 'expect-type';
import { createSelector } from '@veksa/reselect';
import { Selector } from '@veksa/reselect';
import { createSequenceSelector } from '../src/createSequenceSelector';
import { PersonProps, State } from './models';

const stateFixture: State = {
  persons: { data: {} },
  messages: { data: {} },
};

// non-parametric sequence selector returns an array of results
const getNumbers = createSequenceSelector<State, number>([
  (state) => state.persons.currentPersonId ?? 0,
  (state) => state.messages.currentMessageId ?? 0,
]);

expectTypeOf(getNumbers).toEqualTypeOf<Selector<State, number[]>>();
expectTypeOf(getNumbers(stateFixture)).toEqualTypeOf<number[]>();

// a custom selector creator can be provided
const getNumbersWithCreator = createSequenceSelector<State, number>(
  [(state) => state.persons.currentPersonId ?? 0],
  createSelector,
);
expectTypeOf(getNumbersWithCreator(stateFixture)).toEqualTypeOf<number[]>();

// parametric sequence selector keeps the props type
const getParametricNumbers = createSequenceSelector<State, PersonProps, number>([
  (state, props) => props.personId,
  (state) => state.persons.currentPersonId ?? 0,
]);

expectTypeOf(getParametricNumbers).toEqualTypeOf<Selector<State, number[], [PersonProps]>>();
expectTypeOf(getParametricNumbers(stateFixture, { personId: 1 })).toEqualTypeOf<number[]>();
