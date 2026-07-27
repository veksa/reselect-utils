import { expectTypeOf } from 'expect-type';
import { createSegmentSelector } from '../src/createSegmentSelector';
import { PersonState, State } from './models';

const defaultPersonState: PersonState = { data: {} };

// selects a nested segment of the state (State[keyof State] overload)
const getPersons = createSegmentSelector((state: State) => state.persons, defaultPersonState);

expectTypeOf(getPersons).toEqualTypeOf<(state: State) => PersonState>();
expectTypeOf(getPersons).parameter(0).toEqualTypeOf<State>();
expectTypeOf(getPersons).returns.toEqualTypeOf<PersonState>();

// selects the whole state as a segment (SelectedSegment extends State overload)
const getWholeState = createSegmentSelector((state: State) => state, {
  persons: { data: {} },
  messages: { data: {} },
});

expectTypeOf(getWholeState).toEqualTypeOf<(state: State) => State>();

// the selected segment type must be assignable to a member of the state
// @ts-expect-error - a plain string is not a segment of the state
createSegmentSelector((state: State) => state.persons, 'not-a-segment');
