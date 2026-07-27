import { expectTypeOf } from 'expect-type';
import { Selector } from '@veksa/re-reselect';
import { createEmptySelector } from '../src/index';
import { Person, PersonProps, State } from './models';

const stateFixture: State = {
  persons: { data: {} },
  messages: { data: {} },
};

// wrapping a plain selector widens the result with undefined
const baseSelector = (state: State) => state.persons.currentPersonId ?? 0;
const emptySelector = createEmptySelector(baseSelector);

expectTypeOf(emptySelector).toEqualTypeOf<Selector<State, number | undefined>>();
expectTypeOf(emptySelector(stateFixture)).toEqualTypeOf<number | undefined>();

// wrapping a parametric selector collapses to a plain selector of R | undefined
const parametricBaseSelector = (state: State, props: PersonProps) =>
  state.persons.data[props.personId];
const emptyFromParametric = createEmptySelector(parametricBaseSelector);

expectTypeOf(emptyFromParametric).toEqualTypeOf<Selector<State, Person | undefined>>();
expectTypeOf(emptyFromParametric(stateFixture)).toEqualTypeOf<Person | undefined>();
