import {getBracketCode, Token, Tokens, TokenType} from "./tokens";
import {
    ArcCoSin,
    ArcCoTan,
    ArcSin,
    ArcTan,
    CoSin,
    CoSinh,
    CoTan,
    CoTanh,
    Divide,
    Euler,
    Ln,
    Log,
    Minus,
    Negate,
    Node,
    Number,
    Pi,
    Plus,
    Power,
    Sin,
    Sinh,
    Sqrt,
    Tan,
    Tanh,
    Times,
    Variable
} from "../node";
import {BinaryConstructor} from "../node/binary";

type AssociativeParams = [TokenType, BinaryConstructor, boolean][];

const expressions: AssociativeParams = [
    [TokenType.PLUS, Plus, true],
    [TokenType.MINUS, Minus, true]
];

const terms: AssociativeParams = [
    [TokenType.TIMES, Times, true],
    [TokenType.NUMBER, Times, false],
    [TokenType.TEXT, Times, false],
    [TokenType.OPEN_BRACKET, Times, false],
    [TokenType.OBELUS, Divide, true]
];

const powers: AssociativeParams = [[TokenType.POWER, Power, true]];

export class Parser {

    readonly tokens: Tokens;

    constructor(tokens: Tokens) {
        this.tokens = tokens;
    }

    expect(expected: TokenType) {
        const actual = this.tokens.peek();
        if (actual.type !== expected) {
            throw new SyntaxError(`Unexpected token "${actual.type}" at position ${actual.position}. Expected: "${expected}".`);
        }
    }

    parse(): Node {
        let result = this.expression();
        this.expect(TokenType.EOF);
        return result;
    }

    associative(cases: AssociativeParams, next: () => Node): Node {
        let left = next();
        while (true) {
            let creator = cases.find((creator) => creator[0] === this.tokens.peek().type);
            if (creator === undefined) {
                return left;
            }
            if (creator[2]) {
                this.tokens.next();
            }
            left = creator[1].bind(this)(left, next());
        }
    }

    expression() {
        return this.associative(expressions, () => this.term());
    }

    term() {
        return this.associative(terms, () => this.power());
    }

    power() {
        return this.associative(powers, () => this.factor());
    }

    factor(): Node {
        switch (this.tokens.peek().type) {
            case TokenType.TEXT:
                return this.parseText(this.tokens.next());
            case TokenType.MINUS:
                this.tokens.next();
                return Negate(this.factor());
            case TokenType.OPEN_BRACKET:
                let openingBracket = this.tokens.peek();
                this.tokens.next();
                let inside = this.expression();
                this.expect(TokenType.CLOSE_BRACKET);
                let closingBracket = this.tokens.next();
                if (getBracketCode(openingBracket.payload) !== getBracketCode(closingBracket.payload)) {
                    throw new SyntaxError(`Opened bracket "${openingBracket.payload}" has to be closed by the matching bracket. "${closingBracket.payload}" used at position ${closingBracket.position}.`);
                }
                return inside;
            default:
                this.expect(TokenType.NUMBER);
                return Number(this.tokens.next().payload);
        }
    }

    parseText(text: Token<string>): Node {
        const value = text.payload;
        const lastChar = value.substring(text.payload.length - 1);
        const apartFromLast = value.substring(0, value.length - 1);

        let constant = this.knownConstants(value);
        if (constant !== null) {
            return constant;
        }
        let function1 = this.knownFunctions(value);
        if (function1 !== null) {
            return function1(this.factor());
        }
        let function2 = this.knownFunctions(apartFromLast);
        if (function2 !== null) {
            let constant = this.knownConstants(lastChar);
            if (constant !== null) {
                return function2(constant);
            }
            return function2(Variable(lastChar));
        }
        return Variable(value);
    }

    knownConstants(name: string) {
        switch (name) {
            case 'e':
            case 'euler':
                return Euler;
            case 'pi':
            case 'Pi':
            case 'PI':
                return Pi;
            default:
                return null;
        }
    }

    knownFunctions(name: string) {
        switch (name) {
            case 'sqrt':
                return Sqrt;
            case 'ln':
                return Ln;
            case 'log':
                return Log;
            case 'sin':
                return Sin;
            case 'sinh':
                return Sinh;
            case 'asin':
            case 'arcsin':
                return ArcSin;
            case 'cos':
            case 'cosin':
                return CoSin;
            case 'cosh':
            case 'cosinh':
                return CoSinh;
            case 'acos':
            case 'acosin':
            case 'arccos':
            case 'arccosin':
                return ArcCoSin;
            case 'tan':
            case 'tg':
                return Tan;
            case 'tanh':
            case 'tgh':
                return Tanh;
            case 'atan':
            case 'atg':
            case 'arctan':
            case 'arctg':
                return ArcTan;
            case 'cotan':
            case 'cotg':
                return CoTan;
            case 'cotanh':
            case 'cotgh':
                return CoTanh;
            case 'acotan':
            case 'acotg':
            case 'arccotan':
            case 'arccotg':
                return ArcCoTan;
            default:
                return null;
        }
    }

}

export default function parseIt(input: Tokens): Node {
    return new Parser(input).parse();
}