import {derive, INDENT, Node, NodeType, putInTexBrackets, Times, Variables} from "./index";

type Formatter = (argument: string) => string;
type Computer = (argument: number) => number;
type Deriver = (argument: Node, variable: string) => Node;

export const isFunction = (node: Node) => node instanceof FunctionNode && (node.name !== 'NEGATE' || node.argument.type === NodeType.FUNCTION);

export class FunctionNode implements Node {

    type = NodeType.FUNCTION;

    readonly argument: Node;
    readonly name: string;
    readonly formatter;
    readonly computer: Computer;
    readonly deriver: Deriver;
    readonly tex: string;

    constructor(argument: Node, name: string, formatter: Formatter, computer: Computer, deriver: Deriver, tex: string) {
        this.argument = argument;
        this.name = name;
        this.formatter = formatter;
        this.computer = computer;
        this.deriver = deriver;
        this.tex = tex;
    }

    hasVariable(variable: string): boolean {
        return this.argument.hasVariable(variable);
    }

    getVariables = () => this.argument.getVariables();

    compute(variables: Variables): number {
        return this.computer(this.argument.compute(variables));
    }

    format(toVariable: string|null): string {
        return this.formatter(this.argument.format(toVariable));
    }

    toTex(): string {
        return this.tex + (this.argument.type === NodeType.BINARY_OPERATOR || (isFunction(this.argument) && this.name !== 'NEGATE') ? putInTexBrackets(this.argument.toTex()) : this.argument.toTex());
    }

    tree(indent: string = ''): string {
        return `${indent}${this.name}\n${this.argument.tree(indent + INDENT)}`;
    }

    derive(variable: string): Node {
        return Times(this.deriver(this.argument, variable), derive(this.argument, variable));
    }

}

export const Function = (name: string, formatter: Formatter, computer: Computer, deriver: Deriver, tex: string) => (argument: Node) => new FunctionNode(argument, name, formatter, computer, deriver, tex);
