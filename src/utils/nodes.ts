import parseIt from "../math/eval/parser";
import lexIt from "../math/eval/lexer";
import {simplify as mathSimplify} from "mathjs";
import {Divide, Negate, Node, Zero} from "../math/node";
import {xMax, xMin} from "../math/plot/Plot";
import {WeightedValue} from "../math/plot/database";

export const simplify = (node: Node) => parseIt(lexIt(mathSimplify(node.format(null), {}, {exactFractions: true}).toString()));

export const derive = (node: Node, variable: string) => {
    if (node.hasVariable(variable)) {
        return node.derive(variable);
    }
    return Zero;
}

export const deriveAndSimplify = (node: Node, variable: string) => simplify(derive(node, variable));

export const deriveSmart = (node: Node) => deriveAndSimplify(node, node.getVariables()[0]);

export const deriveImplicit = (node: Node) => Negate(Divide(deriveAndSimplify(node, 'x'), deriveAndSimplify(node, 'y')));

export const formatSmart = (node: Node) => node.format(node.getVariables()[0]);

export const putInTexBrackets = (text: string) => `\\left(${text}\\right)`;

export const calcValues = (node: Node): WeightedValue[] => {
    const values: [number, number][] = [];
    const variable = node.getVariables()[0];
    for (let x = xMin; x <= xMax; x += 0.01) {
        values.push([x, node.compute(new Map<string, number>([[variable, x]]))]);
    }
    return values;
};

export const wightedMinAndMax = (node: Node): [WeightedValue, WeightedValue] => {
    const values = calcValues(node);
    const yValues = new Map<number, number>();
    values
        .map(([, y]) => Number(y.toFixed(2)))
        .forEach((y) => yValues.set(y, (yValues.get(y) ?? 0) + 1));
    let max = 0;
    let maxWeighted: WeightedValue = [0, 1];
    let min = 0;
    let minWeighted: WeightedValue = [0, 1];
    yValues.forEach((amount, y) => {
        const value = y * amount;
        if (value > max) {
            max = value;
            maxWeighted = [y, amount];
        }
        if (value < min) {
            min = value;
            minWeighted = [y, amount];
        }
    });
    return [minWeighted, maxWeighted];
};