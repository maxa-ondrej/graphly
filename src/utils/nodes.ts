import parseIt from "../math/eval/parser";
import lexIt from "../math/eval/lexer";
import {simplify as mathSimplify} from "mathjs";
import {Divide, Negate, Node, Zero} from "../math/node";
import {xMax, xMin} from "../math/plot/Plot";
import {WeightedValue} from "../math/plot/database";

/**
 * Simplifies a node
 *
 * @param node
 */
export const simplify = (node: Node) => parseIt(lexIt(mathSimplify(node.format(null), {}, {exactFractions: true}).toString()));

/**
 * Derives a node by the given variable
 *
 * @param node
 * @param variable derivation by
 */
export const derive = (node: Node, variable: string) => {
    if (node.hasVariable(variable)) {
        return node.derive(variable);
    }
    return Zero;
}

/**
 * Derives and simplifies.
 *
 * @param node
 * @param variable derivation by
 */
export const deriveAndSimplify = (node: Node, variable: string) => simplify(derive(node, variable));

/**
 * Detects the variable it should be derived by and derives.
 *
 * @param node
 */
export const deriveSmart = (node: Node) => deriveAndSimplify(node, node.getVariables()[0]);

/**
 * Implicit derivation
 *
 * @param node
 */
export const deriveImplicit = (node: Node) => Negate(Divide(deriveAndSimplify(node, 'x'), deriveAndSimplify(node, 'y')));

/**
 * Detects the variable it should be formatted by and formats.
 *
 * @param node
 */
export const formatSmart = (node: Node) => node.format(node.getVariables()[0]);

/**
 * Puts in tex brackets.
 *
 * @param text
 */
export const putInTexBrackets = (text: string) => `\\left(${text}\\right)`;

/**
 * Calculates all values inside a range (from -10 to 10).
 *
 * @param node
 */
export const calcValues = (node: Node): WeightedValue[] => {
    const values: [number, number][] = [];
    const variable = node.getVariables()[0];
    for (let x = xMin; x <= xMax; x += 0.01) {
        values.push([x, node.compute(new Map<string, number>([[variable, x]]))]);
    }
    return values;
};

/**
 * Finds the min and max interesting values in a smart way.
 *
 * @param node
 */
export const weightedMinAndMax = (node: Node): [WeightedValue, WeightedValue] => {
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