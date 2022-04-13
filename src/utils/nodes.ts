import parseIt from "../math/eval/parser";
import lexIt from "../math/eval/lexer";
import {simplify as mathSimplify} from "mathjs";
import {Divide, Negate, Node, Zero} from "../math/node";
import {xMax, xMin} from "../math/plot/Plot";
import {commonQuantiles} from "./math";

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
export const calcValues = (node: Node): number[] => {
    const values: number[] = [];
    const variable = node.getVariables()[0];
    for (let x = xMin; x <= xMax; x += 0.01) {
        values.push(node.compute(new Map<string, number>([[variable, x]])));
    }
    return values;
};

/**
 * Calculates the first quantile, median and third quantile.
 *
 * @param node
 */
export const importantValues = (node: Node): [number, number, number] => {
    const values = calcValues(node);
    if (node.format(null).search(/(sin|cos)/g) !== -1) {
        const min = parseFloat(Math.min(...values).toFixed(4));
        const max = parseFloat(Math.max(...values).toFixed(4));
        console.log(min, (min + max) / 2, max)

        return [min, (min + max) / 2, max];
    }

    return commonQuantiles(values);
};
