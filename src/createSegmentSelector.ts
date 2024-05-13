export function createSegmentSelector<State, SelectedSegment extends State>(
  fn: (state: State) => SelectedSegment,
  initial: SelectedSegment,
): (state: State) => SelectedSegment;

export function createSegmentSelector<State, SelectedSegment extends State[keyof State]>(
  fn: (state: State) => SelectedSegment,
  initial: SelectedSegment,
): (state: State) => SelectedSegment;

export function createSegmentSelector<State, Key extends keyof State>(fn: Function, initial: unknown) {
  return (state: State) => (fn(state) ?? initial);
}
