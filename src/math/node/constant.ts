import {Node, NodeType, Variables, Zero} from "./index";

/**
 * A constant value.
 */
export class ConstantNode implements Node {

    readonly tex: string;
    readonly functionName: string;
    readonly name: string;
    readonly approximation: number;

    hasVariable = () => false;
    getVariables = () => [];

    type = NodeType.CONSTANT;

    constructor(functionName: string, tex: string, approximation: number) {
        this.functionName = functionName;
        this.name = functionName.toUpperCase();
        this.tex = tex;
        this.approximation = approximation;
    }

    compute(variables: Variables): number {
        return this.approximation;
    }

    format(): string {
        return this.functionName;
    }

    toTex(): string {
        return this.tex;
    }

    tree(indent: string = ''): string {
        return `${indent}${this.name}`;
    }

    derive(variable: string): Node {
        return Zero;
    }

    simplify(): Node {
        return this;
    }

}

/**
 * The constant constructor.
 *
 * @param functionName
 * @param tex
 * @param approximation
 * @constructor
 */
export const Constant = (functionName: string, tex: string, approximation: number) => new ConstantNode(functionName, tex, approximation);
