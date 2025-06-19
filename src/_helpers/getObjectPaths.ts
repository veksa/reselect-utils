import { Path } from '../types';
import { isObject } from './isObject';

export const getObjectPaths = (value: unknown, parentPath: Path = []): Path[] => {
  if (!isObject(value)) {
    return [parentPath];
  }

  return Object.keys(value).reduce<Path[]>((result, key) => {
    const paths = getObjectPaths(value[key], parentPath.concat([key]));
    return result.concat(paths);
  }, []);
};
