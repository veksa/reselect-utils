export const stringifyFunction = (source: unknown) => {
    return String(source).replace(/\s+/g, ' ').trim();
};
