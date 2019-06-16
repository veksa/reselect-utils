import { DeepPartial, Middleware } from 'redux';

export default <S>(
  stateLocalStorageKey: string,
  project: (state: S) => DeepPartial<S>,
) => {
  let prevState: S;

  const middleware: Middleware<{}, S> = ({ getState }) => next => {
    return action => {
      const result = next(action);

      const nextState = getState();
      if (prevState !== nextState) {
        window.localStorage.setItem(
          stateLocalStorageKey,
          JSON.stringify(project(nextState)),
        );
        prevState = nextState;
      }

      return result;
    };
  };

  return Object.assign(middleware, {
    getSavedState: (): DeepPartial<S> | undefined => {
      const savedState = window.localStorage.getItem(stateLocalStorageKey);
      return savedState ? JSON.parse(savedState) : undefined;
    },
  });
};