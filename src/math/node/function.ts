import {derive, INDENT, Node, Times, Variables} from "./index";
import {uniqueJoin} from "../../utils/arrays";

type Formatter = (argument: string) => string;
type Computer = (argument: number) => number;
type Deriver = (argument: Node, variable: string) => Node;
type TexConvertor = (argument: string) => string;

class ParentNode implements Node {

    type = 'function';

    readonly argument: Node;
    readonly name: string;
    readonly formatter;
    readonly computer: Computer;
    readonly deriver: Deriver;
    readonly texConvertor: TexConvertor;

    constructor(argument: Node, name: string, formatter: Formatter, computer: Computer, deriver: Deriver, texConvertor: TexConvertor) {
        this.argument = argument;
        this.name = name;
        this.formatter = formatter;
        this.computer = computer;
        this.deriver = deriver;
        this.texConvertor = texConvertor;
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
        return this.texConvertor(this.argument.toTex());
    }

    tree(indent: string = ''): string {
        return `${indent}${this.name}\n${this.argument.tree(indent + INDENT)}`;
    }

    derive(variable: string): Node {
        return Times(this.deriver(this.argument, variable), derive(this.argument, variable));
    }

}

export const Function = (name: string, formatter: Formatter, computer: Computer, deriver: Deriver, texConvertor: TexConvertor) => (argument: Node) => new ParentNode(argument, name, formatter, computer, deriver, texConvertor);
