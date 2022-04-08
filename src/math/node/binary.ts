import {INDENT, Node, Variables} from "./index";

type Computer = (left: number, right: number) => number;
type Deriver = (left: Node, right: Node, variable: string) => Node;
type Simplifier = (left: Node, right: Node) => Node;
type TexConvertor = (left: string, right: string) => string;

class ParentNode implements Node {

    type = 'binary-operator';

    readonly left: Node;
    readonly right: Node;
    readonly operator: string;
    readonly name: string;
    readonly computer: Computer;
    readonly deriver: Deriver;
    readonly simplifier: Simplifier;
    readonly texConvertor: TexConvertor;

    constructor(left: Node, right: Node, operator: string, name: string, computer: Computer, deriver: Deriver, simplifier: Simplifier, texConvertor: TexConvertor) {
        this.left = left;
        this.right = right;
        this.operator = operator;
        this.name = name;
        this.computer = computer;
        this.deriver = deriver;
        this.simplifier = simplifier;
        this.texConvertor = texConvertor;
    }

    hasVariable(variable: string): boolean {
        return this.left.hasVariable(variable) || this.right.hasVariable(variable);
    }

    compute(variables: Variables): number {
        return this.computer(this.left.compute(variables), this.right.compute(variables));
    }

    format(): string {
        return `(${this.left.format()} ${this.operator} ${this.right.format()})`;
    }

    toTex(): string {
        return this.texConvertor(this.left.toTex(), this.right.toTex());
    }

    tree(indent: string = ''): string {
        return `${indent}${this.name}\n${this.left.tree(indent + INDENT)}\n${this.right.tree(indent + INDENT)}`;
    }

    derive(variable: string): Node {
        return this.deriver(this.left, this.right, variable);
    }

    simplify(): Node {
        return this.simplifier(this.left, this.right);
    }

}

export const Binary = (operator: string, name: string, computer: Computer, deriver: Deriver, simplifier: Simplifier, texConvertor: TexConvertor) => (left: Node, right: Node) => new ParentNode(left, right, operator, name, computer, deriver, simplifier, texConvertor);