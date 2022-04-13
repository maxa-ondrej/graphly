/**
 * Sorts the given array in ascending order.
 *
 * @param arr
 */
export const ascending = (arr: number[]) => arr.sort((a, b) => a - b);

/**
 * Calculates the sum of all values in array.
 *
 * @param arr
 */
export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

/**
 * Calculates the average value of the array.
 *
 * @param arr
 */
export const average = (arr: number[]) => sum(arr) / arr.length;

/**
 * Calculates the quantile of values inside array.
 *
 * @param sorted the array (with all its values sorted!)
 * @param q 0.25 for first quantile, 0.5 for median, 0.75 for third quantile
 */
export const quantile = (sorted: number[], q: number) => {
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};

/**
 * Calculates the first quantile of values inside array.
 * @param arr
 */
export const firstQuantile = (arr: number[]) => quantile(arr, .25);

/**
 * Calculates the median of values inside array.
 * @param arr
 */
export const median = (arr: number[]) => quantile(arr, .5);

/**
 * Calculates the third quantile of values inside array.
 * @param arr
 */
export const thirdQuantile = (arr: number[]) => quantile(arr, .75);

/**
 * Calculates the first quantile, median and third quantile.
 *
 * @param arr
 */
export const commonQuantiles = (arr: number[]): [number, number, number] => {
    const sorted = ascending(arr);
    return [firstQuantile(sorted), median(sorted), thirdQuantile(sorted)];
};
