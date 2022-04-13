/**
 * Removes duplicated elements from the provided array.
 *
 * @param array
 */
export function unique(array: any[]) {
    const a = array.concat();
    for (let i = 0; i < a.length; ++i) {
        for (let j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) {
                a.splice(j--, 1);
            }
        }
    }

    return a;
}

/**
 * Joins two arrays and removes duplicates.
 *
 * @param a first array
 * @param b second array
 */
export const uniqueJoin = (a: any[], b: any[]) => unique([...a, ...b]);