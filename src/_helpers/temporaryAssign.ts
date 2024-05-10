export function temporaryAssign(target: Record<string, unknown>, source: Record<string, unknown>): ({
    result: Record<string, unknown>;
    rollback: () => void;
}) {
    if (typeof target !== 'object' || target === null) {
        return {
            result: source,
            rollback: () => undefined,
        };
    }

    const temporary: Record<string, unknown> = {};
    const deleteProps: string[] = [];

    for (const prop in source as unknown as object) {
        if (Object.prototype.hasOwnProperty.call(source, prop)) {
            const targetProp = target[prop];
            const sourceProp = source[prop];

            if (targetProp !== sourceProp) {
                if (Object.prototype.hasOwnProperty.call(target, prop)) {
                    temporary[prop] = targetProp;
                } else {
                    deleteProps.push(prop);
                }

                target[prop] = sourceProp;
            }
        }
    }

    const rollback = () => {
        for (const prop in temporary) {
            if (Object.prototype.hasOwnProperty.call(temporary, prop)) {
                target[prop] = temporary[prop];
            }
        }

        for (const prop of deleteProps) {
            if (Object.prototype.hasOwnProperty.call(target, prop)) {
                delete target[prop];
            }
        }
    };

    return {
        result: target,
        rollback,
    };
}
