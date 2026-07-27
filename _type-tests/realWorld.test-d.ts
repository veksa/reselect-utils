import { expectTypeOf } from 'expect-type';
import {
  createPathSelector,
  createPropSelector,
  createBoundSelector,
  createAdaptedSelector,
  createChainSelector,
  createCachedStructuredSelector,
} from '../src/index';
import { Message, Person, State } from './models';

const stateFixture: State = {
  persons: { data: {} },
  messages: { data: {} },
};

// a realistic parametric selector built from a path selector
const getPersonName = createPathSelector(
  (state: State, props: { personId: number }) => state.persons.data[props.personId],
).name();

expectTypeOf(getPersonName(stateFixture, { personId: 1 })).toEqualTypeOf<string>();

// bind a concrete person id to reuse the selector without props
const getAdminName = createBoundSelector(getPersonName, { personId: 1 });
expectTypeOf(getAdminName(stateFixture)).toEqualTypeOf<string>();

// adapt an outer props shape into the selector's props
const getNameByUserId = createAdaptedSelector(getPersonName, (props: { userId: number }) => ({
  personId: props.userId,
}));
expectTypeOf(getNameByUserId(stateFixture, { userId: 1 })).toEqualTypeOf<string>();

// prop selectors drive a chain that resolves a person's messages
const getPersonMessages = createChainSelector(createPropSelector<{ personId: number }>().personId())
  .chain(
    (personId) => (state: State) =>
      Object.values(state.messages.data).filter((message) => message.personId === personId),
  )
  .build();

expectTypeOf(getPersonMessages(stateFixture, { personId: 1 })).toEqualTypeOf<Message[]>();

// combine several selectors into a cached structured view model
const getPersonViewModel = createCachedStructuredSelector({
  person: (state: State, props: { personId: number }) => state.persons.data[props.personId],
  name: getPersonName,
  messages: getPersonMessages,
})({
  keySelector: (state, props) => props.personId,
});

expectTypeOf(getPersonViewModel(stateFixture, { personId: 1 })).toEqualTypeOf<{
  person: Person;
  name: string;
  messages: Message[];
}>();
