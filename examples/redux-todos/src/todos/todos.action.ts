import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('Todos');

export const TodosAction = {
  add: actionCreator<{ name?: string }>('ADD'),
  remove: actionCreator<{ id: string }>('REMOVE'),
  complete: actionCreator<{ id: string; completed: boolean }>('COMPLETE'),
};
