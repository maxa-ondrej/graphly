export const weightedAverage = (values: [number, number][], requiredWeight: number) => {
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
    return sum / weight;
}