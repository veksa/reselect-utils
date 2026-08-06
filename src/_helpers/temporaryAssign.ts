const noop = () => undefined;

export function temporaryAssign(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): {
  result: Record<string, unknown>;
  rollback: () => void;
} {
  if (typeof target !== 'object' || target === null) {
    return {
      result: source,
      rollback: noop,
    };
  }

  // Both containers and the closure are allocated only once something actually has
  // to be restored. This runs on every call of every bound selector, and the usual
  // case is a binding whose keys the target does not have — one entry in
  // `deleteProps`, nothing in `temporary` — while a re-entrant call that finds the
  // binding already applied changes nothing at all and can share `noop`.
  let temporary: Record<string, unknown> | null = null;
  let deleteProps: string[] | null = null;

  for (const prop in source as unknown as object) {
    if (Object.prototype.hasOwnProperty.call(source, prop)) {
      const targetProp = target[prop];
      const sourceProp = source[prop];

      if (targetProp !== sourceProp) {
        if (Object.prototype.hasOwnProperty.call(target, prop)) {
          if (temporary === null) {
            temporary = {};
          }
          temporary[prop] = targetProp;
        } else {
          if (deleteProps === null) {
            deleteProps = [];
          }
          deleteProps.push(prop);
        }

        target[prop] = sourceProp;
      }
    }
  }

  if (temporary === null && deleteProps === null) {
    return {
      result: target,
      rollback: noop,
    };
  }

  const restore = temporary;
  const remove = deleteProps;

  const rollback = () => {
    if (restore !== null) {
      for (const prop in restore) {
        if (Object.prototype.hasOwnProperty.call(restore, prop)) {
          target[prop] = restore[prop];
        }
      }
    }

    if (remove !== null) {
      for (const prop of remove) {
        if (Object.prototype.hasOwnProperty.call(target, prop)) {
          delete target[prop];
        }
      }
    }
  };

  return {
    result: target,
    rollback,
  };
}
