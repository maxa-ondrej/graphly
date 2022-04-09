import {Binary} from "./binary";
import {Function} from "./function";
import {Constant} from "./constant";
import {simplify as mathSimplify} from "mathjs";
import parseIt from "../eval/parser";
import lexIt from "../eval/lexer";

export const INDENT = '  ';

export interface Node {

    type: string;

    compute(variables: Variables): number;

    format(): string;

    toTex(): string;

    derive(variable: string): Node;

    hasVariable(variable: string): boolean;

    tree(indent: string): string;

}

export type Variables = Map<string, number>;

export const Number = (value: number): Node => ({
    type: 'number',
    hasVariable: () => false,
    compute(): number {
        return value;
    },
    format(): string {
        return `${value}`;
    },
    toTex(): string {
        return this.format();
    },
    tree(indent: string): string {
        return indent + value;
    },
    derive(): Node {
        return Zero;
    }
});

export const Variable = (name: string): Node => ({
    type: 'variable',
    hasVariable: (variable: string) => name === variable,
    compute(variables: Variables): number {
        return variables.get(name) ?? 0;
    },
    format(): string {
        return name;
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

export const simplify = (node: Node) => parseIt(lexIt(mathSimplify(node.format(), {}, {exactFractions: true}).toString()));

export const derive = (node: Node, variable: string) => {
    if (node.hasVariable(variable)) {
        return node.derive(variable);
    }
    return Zero;
}

export const deriveAndSimplify = (node: Node, variable: string) => simplify(derive(node, variable));

export const nodesEqual = (a: Node, b: Node) => {
    if (a.type !== b.type) {
        return false;
    }
    return a.format() === b.format();
}

export const Zero = Number(0);
export const One = Number(1);
export const NegativeOne = Number(-1);

export const Negate = (node: Node) => {
    if (node.type === 'number') {
        return Number(parseInt(node.format()) * (-1));
    }
    return Times(NegativeOne, node);
};

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
}, (left, right) => `\\left(${left} + ${right}\\right)`);

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
}, (left, right) => `\\left(${left} - ${right}\\right)`);
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
    return Power(Euler, Times(b, Ln(a))).derive(variable);
}, (left, right) => `\\left(${left}\\right)^{${right}}`);

export const Euler = Constant('exp(1)', 'e', Math.E);
export const Pi = Constant('PI', '\\pi', Math.PI);

export const Sqrt = Function('SQRT', argument => `sqrt(${argument})`, Math.sqrt, (argument) => Times(Fraction(-1, 2), Power(argument, Minus(Fraction(-1, 2), One))), argument => `\\sqrt{\\left(${argument}\\right)}`);

export const Ln = Function('LN', argument => `log(${argument}) / log(exp(1))`, Math.log, (argument) => Divide(One, argument), argument => `\\ln{\\left(${argument}\\right)}`);
export const Log = Function('LOG', argument => `log(${argument})`, Math.log10, (argument) => Divide(One, Times(argument, Ln(Number(10)))), argument => `\\log{\\left(${argument}\\right)}`);

export const Sin = Function('SIN', argument => `sin(${argument})`, Math.sin, (argument) => CoSin(argument), argument => `\\sin{\\left(${argument}\\right)}`);
export const Sinh = Function('SINH', argument => `sinh(${argument})`, Math.sinh, (argument) => CoSinh(argument), argument => `\\sinh{\\left(${argument}\\right)}`);
export const ArcSin = Function('ARCSIN', argument => `asin(${argument})`, Math.asin, (argument) => Power(Minus(One, Power(argument, Number(2))), Fraction(-1, 2)), argument => `\\arcsin{\\left(${argument}\\right)}`);

export const CoSin = Function('COS', argument => `cos(${argument})`, Math.cos, (argument) => Negate(Sin(argument)), argument => `\\cos{\\left(${argument}\\right)}`);
export const CoSinh = Function('COSH', argument => `cosh(${argument})`, Math.cosh, (argument) => Sinh(argument), argument => `\\cosh{\\left(${argument}\\right)}`);
export const ArcCoSin = Function('ARCCOS', argument => `acos(${argument})`, Math.acos, (argument) => Negate(Power(Minus(One, Power(argument, Number(2))), Fraction(-1, 2))), argument => `\\arccos{\\left(${argument}\\right)}`);

export const Tan = Function('TAN', argument => `tan(${argument})`, Math.tan, (argument) => Power(CoSin(argument), Number(-2)), argument => `\\tan{\\left(${argument}\\right)}`);
export const Tanh = Function('TANH', argument => `tanh(${argument})`, Math.tanh, (argument) => Minus(One, Power(Tanh(argument), Number(2))), argument => `\\tanh{\\left(${argument}\\right)}`);
export const ArcTan = Function('ARCTAN', argument => `atan(${argument})`, Math.atan, (argument) => Divide(One, Plus(One, Power(argument, Number(2)))), argument => `\\arctan{\\left(${argument}\\right)}`);

export const CoTan = Function('COTAN', argument => `1 / tan(${argument})`, argument => 1 / Math.tan(argument), (argument) => Negate(Power(Sin(argument), Number(-2))), argument => `\\cot{\\left(${argument}\\right)}`);
export const CoTanh = Function('COTANH', argument => `(exp(2 * (${argument})) + 1)/(exp(2 * (${argument})) - 1)`, argument => (Math.E ** (2 * argument) + 1) / (Math.E ** (2 * argument) - 1), (argument) => Minus(One, Power(CoTanh(argument), Number(2))), argument => `\\coth{\\left(${argument}\\right)}`);
export const ArcCoTan = Function('ARCCOTAN', argument => `PI / 2 - atan(${argument})`, argument => Math.PI / 2 - Math.atan(argument), (argument, variable) => Divide(NegativeOne, Plus(One, Power(argument, Number(2)))), argument => `\\text{arccot}{\\left(${argument}\\right)}`);
