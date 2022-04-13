/**
 * Calculates the wighted average. If a weight of a number is smaller when the required, it is skipped.
 * If no values remain after, requiredWeight is decreased by one and process repeats.
 *
 * @param values the values to find average of
 * @param requiredWeight the required weight
 */
export const weightedAverage = (values: [number, number][], requiredWeight: number): number => {
    if (values.length === 0) {
        return 0;
    }
    let sum = 0;
    let weight = 0;
    values.forEach((value) => {
        const currentWeight = value[1];
        if (currentWeight < requiredWeight) {
            return;
        }
        sum += value[0] * currentWeight;
        weight += currentWeight;
    });
    if (weight === 0) {
        if (requiredWeight === 1) {
            return 0;
        }
        return weightedAverage(values, requiredWeight - 1);
    }
    return sum / weight;
}