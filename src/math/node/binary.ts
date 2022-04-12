import {INDENT, Node, NodeType, putInTexBrackets, Variables} from "./index";
import {uniqueJoin} from "../../utils/arrays";
import {FunctionNode, isFunction} from "./function";

type Computer = (left: number, right: number) => number;
type Deriver = (left: Node, right: Node, variable: string) => Node;
type TexConvertor = (left: string, right: string) => string;

export class BinaryNode implements Node {

    type = NodeType.BINARY_OPERATOR;

    readonly left: Node;
    readonly right: Node;
    readonly operator: string;
    readonly name: string;
    readonly computer: Computer;
    readonly deriver: Deriver;
    readonly texConvertor: TexConvertor;

    constructor(left: Node, right: Node, operator: string, name: string, computer: Computer, deriver: Deriver, texConvertor: TexConvertor) {
        this.left = left;
        this.right = right;
        this.operator = operator;
        this.name = name;
        this.computer = computer;
        this.deriver = deriver;
        this.texConvertor = texConvertor;
    }

    hasVariable = (variable: string) => this.left.hasVariable(variable) || this.right.hasVariable(variable);

    getVariables = () => uniqueJoin(this.left.getVariables(), this.right.getVariables());

    compute(variables: Variables): number {
        return this.computer(this.left.compute(variables), this.right.compute(variables));
    }

    format(toVariable: string | null): string {
        return `(${this.left.format(toVariable)} ${this.operator} ${this.right.format(toVariable)})`;
    }

    toTex(): string {
        const left = this.left.toTex();
        const leftInBrackets = putInTexBrackets(left);
        const leftIsBinary = this.left.type === NodeType.BINARY_OPERATOR;
        const leftIsPlusOrMinus = this.left instanceof BinaryNode && ['+', '-'].includes(this.left.operator);
        const right = this.right.toTex();
        const rightInBrackets = putInTexBrackets(right);
        const rightIsBinary = this.right.type === NodeType.BINARY_OPERATOR;
        const rightIsPlusOrMinus = this.right instanceof BinaryNode && ['+', '-'].includes(this.right.operator);
        if ((!leftIsBinary && !rightIsBinary && this.left.type !== NodeType.FUNCTION) || this.operator === '+') {
            return this.texConvertor(left, right);
        }

        if (this.operator === '-') {
            if (rightIsBinary && rightIsPlusOrMinus) {
                return this.texConvertor(left, rightInBrackets);
            }

            return this.texConvertor(left, right);
        }

        if (this.operator === '*') {
            return this.texConvertor(leftIsPlusOrMinus || isFunction(this.left) ? leftInBrackets : left, rightIsPlusOrMinus ? rightInBrackets : right);
        }

        if (this.operator === '^') {
            return this.texConvertor(this.left instanceof BinaryNode && this.left.operator === '^' ? leftInBrackets : left, rightIsPlusOrMinus ? rightInBrackets : right);
        }

        return this.texConvertor(left, right);
    }

    tree(indent: string = ''): string {
        return `${indent}${this.name}\n${this.left.tree(indent + INDENT)}\n${this.right.tree(indent + INDENT)}`;
    }

    derive(variable: string): Node {
        return this.deriver(this.left, this.right, variable);
    }

}

export type BinaryConstructor = (left: Node, right: Node) => Node;

export const Binary = (operator: string, name: string, computer: Computer, deriver: Deriver, texConvertor: TexConvertor): BinaryConstructor => (left: Node, right: Node) => new BinaryNode(left, right, operator, name, computer, deriver, texConvertor);