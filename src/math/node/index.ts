import {Binary} from "./binary";
import {Function} from "./function";
import {Constant} from "./constant";

export const INDENT = '  ';

export interface Node {

    type: string;

    compute(variables: Variables): number;

    format(): string;

    toTex(): string;

    derive(variable: string): Node;

    simplify(): Node;

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
    },
    simplify(): Node {
        return this;
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
    },
    simplify(): Node {
        return this;
    }
});

export const Expression = (node: Node): Node => ({
    type: 'expression',
    hasVariable: () => true,
    compute(variables: Variables = new Map<string, number>()): number {
        return node.compute(variables);
    },
    format(): string {
        return node.format();
    },
    toTex(): string {
        return node.toTex();
    },
    tree(): string {
        return node.tree('');
    },
    derive(variable: string): Node {
        return deriveIfDerivable(node, variable);
    },
    simplify(): Node {
        return node.simplify();
    }
});

export const deriveIfDerivable = (node: Node, variable: string) => {
    if (node.hasVariable(variable)) {
        return node.derive(variable);
    }
    return Zero;
}

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
    let derA = deriveIfDerivable(a, variable);
    if (!b.hasVariable) {
        return derA;
    }
    let derB = deriveIfDerivable(b, variable);
    if (!a.hasVariable) {
        return derB;
    }
    return Plus(derA, derB);
}, (a, b) => {
    let simA = a.simplify();
    let simB = b.simplify();
    if (nodesEqual(simA, Zero)) {
        return simB;
    }
    if (nodesEqual(simB, Zero)) {
        return simA;
    }
    return Plus(simA, simB);
}, (left, right) => `\\left(${left} + ${right}\\right)`);

export const Minus = Binary('-', 'MINUS', (a, b) => a - b, (a, b, variable) => {
    let derA = deriveIfDerivable(a, variable);
    if (!b.hasVariable) {
        return derA;
    }
    let derB = deriveIfDerivable(b, variable);
    if (!a.hasVariable) {
        return Negate(derB);
    }
    return Minus(derA, derB);
}, (a, b) => {
    let simA = a.simplify();
    let simB = b.simplify();
    if (nodesEqual(simA, Zero)) {
        return Negate(simB).simplify();
    }
    if (nodesEqual(simB, Zero)) {
        return simA;
    }
    if (nodesEqual(simA, simB)) {
        return Zero;
    }
    return Minus(simA, simB);
}, (left, right) => `\\left(${left} - ${right}\\right)`);
export const Times = Binary('*', 'TIMES', (a, b) => a * b, (a, b, variable) => {
    let derA = deriveIfDerivable(a, variable);
    if (!b.hasVariable) {
        return Times(b, derA);
    }
    let derB = deriveIfDerivable(b, variable);
    if (!a.hasVariable) {
        return Times(a, derB);
    }
    return Plus(Times(derA, b), Times(a, derB));
}, (a, b) => {
    let simA = a.simplify();
    let simB = b.simplify();
    if (nodesEqual(simA, Zero) || nodesEqual(simB, Zero)) {
        return Zero;
    }
    if (nodesEqual(simA, One)) {
        return simB;
    }
    if (nodesEqual(simA, NegativeOne)) {
        return Negate(simB);
    }
    if (nodesEqual(simB, One)) {
        return simA;
    }
    if (nodesEqual(simB, NegativeOne)) {
        return Negate(simA);
    }
    return Times(simA, simB);
}, (left, right) => `{${left}} \\cdot {${right}}`);
export const Divide = Binary('/', 'OBELUS', (a, b) => a / b, (a, b, variable) => {
    let derA = deriveIfDerivable(a, variable);
    if (!b.hasVariable) {
        return Divide(derA, b);
    }
    if (!a.hasVariable) {
        return Times(a, Power(b, NegativeOne).derive(variable));
    }
    return Divide(
        Minus(Times(derA, b), Times(a, deriveIfDerivable(b, variable))),
        Power(b, Number(2))
    );
}, (a, b) => {
    let simB = b.simplify();
    if (nodesEqual(simB, Zero)) {
        return Divide(One, Zero);
    }
    let simA = a.simplify();
    if (nodesEqual(simA, Zero)) {
        return Zero;
    }
    return Divide(simA, simB);
}, (left, right) => `\\frac{${left}}{${right}}`);
export const Power = Binary('^', 'POWER', (a, b) => a ** b, (a, b, variable) => {
    if (nodesEqual(b, One)) {
        return deriveIfDerivable(a, variable);
    }

    let derA = deriveIfDerivable(a, variable);
    if (!b.hasVariable) {
        return Times(Times(b, Power(a, Minus(b, One))), derA);
    }

    let derB = deriveIfDerivable(b, variable);
    if (!a.hasVariable) {
        if (nodesEqual(a, Euler)) {
            return Times(Power(Euler, b), derB);
        }
        return Times(Times(Power(a, b), Ln(a)), derB);
    }
    return Power(Euler, Times(b, Ln(a))).derive(variable);
}, (a, b) => {
    let simA = a.simplify();
    if (nodesEqual(simA, Zero)) {
        return Zero;
    }
    let simB = b.simplify();
    if (nodesEqual(simB, Zero)) {
        return One;
    }
    return Power(simA, simB);
}, (left, right) => `\\left(${left}\\right)^{${right}}`);

export const Euler = Constant('exp(1)', 'e', Math.E);
export const Pi = Constant('PI', '\\pi', Math.PI);

export const Ln = Function('LN', argument => `log(${argument}) / log(exp(1))`, Math.log, (argument, variable) => Divide(deriveIfDerivable(argument, variable), argument), argument => `\\ln{\\left(${argument}\\right)}`);
export const Log = Function('LOG', argument => `log(${argument})`, Math.log10, (argument, variable) => Divide(deriveIfDerivable(argument, variable), Times(argument, Ln(Number(10)))), argument => `\\log{\\left(${argument}\\right)}`);

export const Sin = Function('SIN', argument => `sin(${argument})`, Math.sin, (argument, variable) => Times(deriveIfDerivable(argument, variable), CoSin(argument)), argument => `\\sin{\\left(${argument}\\right)}`);
export const Sinh = Function('SINH', argument => `sinh(${argument})`, Math.sinh, (argument, variable) => Times(deriveIfDerivable(argument, variable), CoSinh(argument)), argument => `\\sinh{\\left(${argument}\\right)}`);
export const ArcSin = Function('ARCSIN', argument => `asin(${argument})`, Math.asin, (argument, variable) => Divide(deriveIfDerivable(argument, variable), Power(Minus(One, Power(argument, Number(2))), Fraction(1, 2))), argument => `\\arcsin{\\left(${argument}\\right)}`);

export const CoSin = Function('COS', argument => `cos(${argument})`, Math.cos, (argument, variable) => Negate(Times(deriveIfDerivable(argument, variable), Sin(argument))), argument => `\\cos{\\left(${argument}\\right)}`);
export const CoSinh = Function('COSH', argument => `cosh(${argument})`, Math.cosh, (argument, variable) => Times(deriveIfDerivable(argument, variable), Sinh(argument)), argument => `\\cosh{\\left(${argument}\\right)}`);
export const ArcCoSin = Function('ARCCOS', argument => `acos(${argument})`, Math.acos, (argument, variable) => Divide(Negate(deriveIfDerivable(argument, variable)), Power(Minus(One, Power(argument, Number(2))), Fraction(1, 2))), argument => `\\arccos{\\left(${argument}\\right)}`);

export const Tan = Function('TAN', argument => `tan(${argument})`, Math.tan, (argument, variable) => Divide(deriveIfDerivable(argument, variable), Power(CoSin(argument), Number(2))), argument => `\\tan{\\left(${argument}\\right)}`);
export const Tanh = Function('TANH', argument => `tanh(${argument})`, Math.tanh, (argument, variable) => Times(deriveIfDerivable(argument, variable), Minus(One, Power(Tanh(argument), Number(2)))), argument => `\\tanh{\\left(${argument}\\right)}`);
export const ArcTan = Function('ARCTAN', argument => `atan(${argument})`, Math.atan, (argument, variable) => Divide(deriveIfDerivable(argument, variable), Plus(One, Power(argument, Number(2)))), argument => `\\arctan{\\left(${argument}\\right)}`);

export const CoTan = Function('COTAN', argument => `1 / tan(${argument})`, argument => 1 / Math.tan(argument), (argument, variable) => Divide(Negate(deriveIfDerivable(argument, variable)), Power(Sin(argument), Number(2))), argument => `\\cot{\\left(${argument}\\right)}`);
export const CoTanh = Function('COTANH', argument => `(exp(2 * (${argument})) + 1)/(exp(2 * (${argument})) - 1)`, argument => (Math.E ** (2 * argument) + 1) / (Math.E ** (2 * argument) - 1), (argument, variable) => Times(deriveIfDerivable(argument, variable), Minus(One, Power(CoTanh(argument), Number(2)))), argument => `\\coth{\\left(${argument}\\right)}`);
export const ArcCoTan = Function('ARCCOTAN', argument => `PI / 2 - atan(${argument})`, argument => Math.PI / 2 - Math.atan(argument), (argument, variable) => Divide(Negate(deriveIfDerivable(argument, variable)), Plus(One, Power(argument, Number(2)))), argument => `\\text{arccot}{\\left(${argument}\\right)}`);
