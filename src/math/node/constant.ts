import {Node, Variables, Zero} from "./index";

class ParentNode implements Node {

    readonly tex: string;
    readonly functionName: string;
    readonly name: string;
    readonly approximation: number;

    hasVariable = () => false;
    type = 'constant';

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

export const Constant = (functionName: string, tex: string, approximation: number) => new ParentNode(functionName, tex, approximation);
