import {Binary} from "./binary";
import {Function} from "./function";
import {Constant} from "./constant";
import {derive} from "../../utils/nodes";

export const INDENT = '  ';

/**
 * Enum of all node types.
 */
export enum NodeType {
    NUMBER = 'number',
    VARIABLE = 'variable',
    BINARY_OPERATOR = 'binary-operator',
    FUNCTION = 'function',
    CONSTANT = 'constant',
}

/**
 * The ancestor of all nodes.
 */
export interface Node {

    type: NodeType;

    compute(variables: Variables): number;

    format(toVariable: string|null): string;

    toTex(): string;

    derive(variable: string): Node;

    hasVariable(variable: string): boolean;

    getVariables(): string[];

    tree(indent: string): string;

}

/**
 * Type of variables map, that can be used to compute the value of a node.
 */
export type Variables = Map<string, number>;

/**
 * The number node.
 *
 * @param value
 * @constructor
 */
export const Number = (value: number): Node => ({
    type: NodeType.NUMBER,
    hasVariable: () => false,
    getVariables: () => [],
    compute(): number {
        return value;
    },
    format(): string {
        return `${value}`;
    },
    toTex(): string {
        return `${value}`;
    },
    tree(indent: string): string {
        return indent + value;
    },
    derive(): Node {
        return Zero;
    }
});

/**
 * The variable node.
 *
 * @param name
 * @constructor
 */
export const Variable = (name: string): Node => ({
    type: NodeType.VARIABLE,
    hasVariable: (variable: string) => name === variable,
    getVariables: () => [name],
    compute(variables: Variables): number {
        return variables.get(name) ?? 0;
    },
    format(toVariable: string|null): string {
        return toVariable ?? name;
    },
    toTex(): string {
        return name;
    },
    tree(indent: string): string {
        return `${indent}VARIABLE(${name})`;
    },
    derive(): Node {
        return One;
    }
});

const nodesEqual = (a: Node, b: Node) => {
    if (a.type !== b.type) {
        return false;
    }
    return a.format(null) === b.format(null);
}

/**
 * Number node with value of 0
 */
export const Zero = Number(0);
/**
 * Number node with value of 1
 */
export const One = Number(1);
/**
 * Number node with value of -1
 */
export const NegativeOne = Number(-1);

/**
 * Fraction of numbers constructor.
 *
 * @param d denominator
 * @param n numerator
 * @constructor
 */
export const Fraction = (d: number, n: number): Node => Divide(Number(d), Number(n));

export const Plus = Binary('+', 'PLUS', (a, b) => a + b, (a, b, variable) => {
    let derA = derive(a, variable);
    if (!b.hasVariable(variable)) {
        return derA;
    }
    let derB = derive(b, variable);
    if (!a.hasVariable(variable)) {
        return derB;
    }
    return Plus(derA, derB);
}, (left, right) => `${left} + ${right}`);

export const Minus = Binary('-', 'MINUS', (a, b) => a - b, (a, b, variable) => {
    let derA = derive(a, variable);
    if (!b.hasVariable(variable)) {
        return derA;
    }
    let derB = derive(b, variable);
    if (!a.hasVariable(variable)) {
        return Negate(derB);
    }
    return Minus(derA, derB);
}, (left, right) => `${left} - ${right} `);
export const Times = Binary('*', 'TIMES', (a, b) => a * b, (a, b, variable) => {
    let derA = derive(a, variable);
    if (!b.hasVariable(variable)) {
        return Times(b, derA);
    }
    let derB = derive(b, variable);
    if (!a.hasVariable(variable)) {
        return Times(a, derB);
    }
    return Plus(Times(derA, b), Times(a, derB));
}, (left, right) => `{${left}} \\cdot {${right}}`);
export const Divide = Binary('/', 'OBELUS', (a, b) => a / b, (a, b, variable) => {
    let derA = derive(a, variable);
    if (!b.hasVariable(variable)) {
        return Divide(derA, b);
    }
    if (!a.hasVariable(variable)) {
        return Times(a, Power(b, NegativeOne).derive(variable));
    }
    return Divide(
        Minus(Times(derA, b), Times(a, derive(b, variable))),
        Power(b, Number(2))
    );
}, (left, right) => `\\frac{${left}}{${right}}`);
export const Power = Binary('^', 'POWER', (a, b) => a ** b, (a, b, variable) => {
    if (nodesEqual(b, One)) {
        return derive(a, variable);
    }

    if (!b.hasVariable(variable)) {
        return Times(Times(b, Power(a, Minus(b, One))), derive(a, variable));
    }

    let derB = derive(b, variable);
    if (!a.hasVariable(variable)) {
        if (nodesEqual(a, Euler)) {
            return Times(Power(Euler, b), derB);
        }
        return Times(Times(Power(a, b), Ln(a)), derB);
    }
    return derive(Power(Euler, Times(b, Ln(a))), variable);
}, (left, right) => `${left}^{${right}}`);

export const Euler = Constant('exp(1)', 'e', Math.E);
export const Pi = Constant('PI', '\\pi', Math.PI);

export const Sqrt = Function('SQRT', argument => `sqrt(${argument})`, Math.sqrt, (argument) => Times(Fraction(-1, 2), Power(argument, Minus(Fraction(-1, 2), One))), '\\sqrt');
export const Negate = Function('NEGATE', argument => `-(${argument})`, argument => argument * (-1), () => NegativeOne, '-');

export const Ln = Function('LN', argument => `log(${argument}) / log(exp(1))`, Math.log, (argument) => Divide(One, argument), '\\ln');
export const Log = Function('LOG', argument => `log(${argument})`, Math.log10, (argument) => Divide(One, Times(argument, Ln(Number(10)))), '\\log');

export const Sin = Function('SIN', argument => `sin(${argument})`, Math.sin, (argument) => CoSin(argument), '\\sin');
export const Sinh = Function('SINH', argument => `sinh(${argument})`, Math.sinh, (argument) => CoSinh(argument), '\\sinh');
export const ArcSin = Function('ARCSIN', argument => `asin(${argument})`, Math.asin, (argument) => Power(Minus(One, Power(argument, Number(2))), Fraction(-1, 2)), '\\arcsin');

export const CoSin = Function('COS', argument => `cos(${argument})`, Math.cos, (argument) => Negate(Sin(argument)), '\\cos');
export const CoSinh = Function('COSH', argument => `cosh(${argument})`, Math.cosh, (argument) => Sinh(argument), '\\cosh');
export const ArcCoSin = Function('ARCCOS', argument => `acos(${argument})`, Math.acos, (argument) => Negate(Power(Minus(One, Power(argument, Number(2))), Fraction(-1, 2))), '\\arccos');

export const Tan = Function('TAN', argument => `tan(${argument})`, Math.tan, (argument) => Power(CoSin(argument), Number(-2)), '\\tan');
export const Tanh = Function('TANH', argument => `tanh(${argument})`, Math.tanh, (argument) => Minus(One, Power(Tanh(argument), Number(2))), '\\tanh');
export const ArcTan = Function('ARCTAN', argument => `atan(${argument})`, Math.atan, (argument) => Divide(One, Plus(One, Power(argument, Number(2)))), '\\arctan');

export const CoTan = Function('COTAN', argument => `1 / tan(${argument})`, argument => 1 / Math.tan(argument), (argument) => Negate(Power(Sin(argument), Number(-2))), '\\cot');
export const CoTanh = Function('COTANH', argument => `(exp(2 * (${argument})) + 1)/(exp(2 * (${argument})) - 1)`, argument => (Math.E ** (2 * argument) + 1) / (Math.E ** (2 * argument) - 1), (argument) => Minus(One, Power(CoTanh(argument), Number(2))), '\\coth');
export const ArcCoTan = Function('ARCCOTAN', argument => `PI / 2 - atan(${argument})`, argument => Math.PI / 2 - Math.atan(argument), (argument, variable) => Divide(NegativeOne, Plus(One, Power(argument, Number(2)))), `\\text{arccot}`);
