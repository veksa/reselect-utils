export function createSegmentSelector<State>(fn: (state: State) => State, initial: State): (state: State) => State;

export function createSegmentSelector<State>(fn: (state: State) => State[keyof State], initial: State[keyof State]): (state: State) => State[keyof State];

export function createSegmentSelector<State, Key extends keyof State>(fn: Function, initial: unknown) {
  return (state: State) => (fn(state) ?? initial);
}
