import { expectTypeOf } from 'expect-type';
import { Selector, ParametricSelector } from '@veksa/re-reselect';
import { createChainSelector } from '../src/index';
import { Person, PersonProps, State } from './models';

const stateFixture: State = {
  persons: { data: {} },
  messages: { data: {} },
};

// `map` transforms the result type of the chain
const getPersonList = createChainSelector((state: State) => state.persons.data)
  .map((data) => Object.values(data))
  .build();

expectTypeOf(getPersonList).toExtend<Selector<State, Person[]>>();
expectTypeOf(getPersonList(stateFixture)).toEqualTypeOf<Person[]>();

// multiple `map` steps compose the transformations
const getPersonCount = createChainSelector((state: State) => state.persons.data)
  .map((data) => Object.values(data))
  .map((persons) => persons.length)
  .build();

expectTypeOf(getPersonCount(stateFixture)).toEqualTypeOf<number>();

// `chain` swaps in a new selector produced from the previous result
const getCurrentPerson = createChainSelector(
  (state: State) => state.persons.currentPersonId ?? 0,
)
  .chain((personId) => (state: State) => state.persons.data[personId])
  .build();

expectTypeOf(getCurrentPerson(stateFixture)).toEqualTypeOf<Person>();

// parametric selectors keep their props type through `chain`
const getPersonById = createChainSelector(
  (state: State, props: PersonProps) => props.personId,
)
  .chain((personId) => (state: State) => state.persons.data[personId])
  .build();

expectTypeOf(getPersonById).toExtend<
  ParametricSelector<State, PersonProps, Person>
>();
expectTypeOf(getPersonById(stateFixture, { personId: 1 })).toEqualTypeOf<Person>();

// `map` also works on parametric chains
const getPersonIdPlusOne = createChainSelector(
  (state: State, props: PersonProps) => props.personId,
)
  .map((personId) => personId + 1)
  .build();

expectTypeOf(
  getPersonIdPlusOne(stateFixture, { personId: 1 }),
).toEqualTypeOf<number>();
