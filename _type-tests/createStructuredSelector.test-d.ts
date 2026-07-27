import { expectTypeOf } from 'expect-type';
import { createStructuredSelector } from '../src/createStructuredSelector';
import { Person, PersonProps, State } from './models';

const stateFixture: State = {
  persons: { data: {} },
  messages: { data: {} },
};

// the result is an object of the selected values with matching keys
const structuredSelector = createStructuredSelector({
  currentPersonId: (state: State) => state.persons.currentPersonId ?? 0,
  personCount: (state: State) => Object.keys(state.persons.data).length,
});

expectTypeOf(structuredSelector(stateFixture)).toEqualTypeOf<{
  currentPersonId: number;
  personCount: number;
}>();

// parametric input selectors produce a parametric structured selector
const parametricStructuredSelector = createStructuredSelector({
  person: (state: State, props: PersonProps) => state.persons.data[props.personId],
  personId: (state: State, props: PersonProps) => props.personId,
});

expectTypeOf(
  parametricStructuredSelector(stateFixture, { personId: 1 }),
).toEqualTypeOf<{
  person: Person;
  personId: number;
}>();
