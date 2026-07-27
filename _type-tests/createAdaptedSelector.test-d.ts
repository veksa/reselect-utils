import { expectTypeOf } from 'expect-type';
import { createAdaptedSelector } from '../src/index';
import { Person, State } from './models';

const personByNameSelector = (
  state: State,
  props: { name: string },
): Person | undefined =>
  Object.values(state.persons.data).find((person) => person.name === props.name);

// the adapter maps the outer props shape to the inner one
const adaptedSelector = createAdaptedSelector(
  personByNameSelector,
  (props: { personName: string }) => ({ name: props.personName }),
);

expectTypeOf(adaptedSelector).parameter(0).toEqualTypeOf<State>();
expectTypeOf(adaptedSelector).parameter(1).toEqualTypeOf<{ personName: string }>();
expectTypeOf(
  adaptedSelector({ persons: { data: {} }, messages: { data: {} } }, {
    personName: 'Marry',
  }),
).toEqualTypeOf<Person | undefined>();
