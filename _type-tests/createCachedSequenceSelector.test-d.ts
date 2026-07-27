import { expectTypeOf } from 'expect-type';
import { createCachedSequenceSelector } from '../src/index';
import { PersonProps, State } from './models';

const stateFixture: State = {
  persons: { data: {} },
  messages: { data: {} },
};

// parametric cached sequence selector returns an array of the results
const cachedSequenceSelector = createCachedSequenceSelector<State, PersonProps, number>([
  (state, props) => props.personId,
  (state) => state.persons.currentPersonId ?? 0,
])({
  keySelector: (state, props) => props.personId,
});

expectTypeOf(cachedSequenceSelector(stateFixture, { personId: 1 })).toEqualTypeOf<number[]>();
