import { expectTypeOf } from 'expect-type';
import { useSelector } from '../src/index';
import { PersonProps, State } from './models';

// plain selector returns its result type
const currentPersonId = useSelector(
  (state: State) => state.persons.currentPersonId ?? 0,
);
expectTypeOf(currentPersonId).toEqualTypeOf<number>();

// parametric selector requires props and returns its result type
const personId = useSelector(
  (state: State, props: PersonProps) => props.personId,
  { personId: 1 },
);
expectTypeOf(personId).toEqualTypeOf<number>();
