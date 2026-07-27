export function createSegmentSelector<State, SelectedSegment extends State | State[keyof State]>(
  fn: (state: State) => SelectedSegment,
  initial: SelectedSegment,
): (state: State) => SelectedSegment {
  return (state: State) => fn(state) ?? initial;
}
