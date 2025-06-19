import { Path } from '../types';

export const arePathsEqual = (path: Path, anotherPath: Path) => {
  if (path.length !== anotherPath.length) {
    return false;
  }

  for (let i = 0; i < path.length; i += 1) {
    if (path[i] !== anotherPath[i]) {
      return false;
    }
  }

  return true;
};
