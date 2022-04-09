import {getBracketCode, Tokens, TokenType} from "./tokens";
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
    Variable, Zero
} from "../node";

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

    expression(): Node {
        const left = this.minus();
        if (this.tokens.peek().type === TokenType.PLUS) {
            this.tokens.next();
            return Plus(left, this.expression());
        }

        return left;
    }

    minus(): Node {
        if (this.tokens.peek().type === TokenType.MINUS) {
            this.tokens.next();
            return Minus(Zero, this.minus());
        }

        const left = this.factor();
        if (this.tokens.peek().type === TokenType.MINUS) {
            this.tokens.next();
            return Minus(left, this.minus());
        }

        return left;
    }

    factor(): Node {
        let left = this.power();
        let type = this.tokens.peek().type;
        switch (type) {
            case TokenType.TIMES:
            case TokenType.OBELUS:
            case TokenType.NUMBER:
            case TokenType.TEXT:
            case TokenType.OPEN_BRACKET:
                if (type === TokenType.OBELUS || type === TokenType.TIMES) {
                    this.tokens.next();
                }
                let right = this.factor();
                if (type === TokenType.OBELUS) {
                    return Divide(left, right);
                }
                return Times(left, right);
        }
        return left;
    }

    power(): Node {
        let left = this.brackets();
        if (this.tokens.peek().type === TokenType.POWER) {
            this.tokens.next();
            let right = this.power();
            return Power(left, right);
        }
        return left;
    }

    brackets(): Node {
        let openingBracket = this.tokens.peek();
        if (openingBracket.type === TokenType.OPEN_BRACKET) {
            this.tokens.next();
            let inside = this.expression();
            this.expect(TokenType.CLOSE_BRACKET);
            let closingBracket = this.tokens.next();
            if (getBracketCode(openingBracket.payload) !== getBracketCode(closingBracket.payload)) {
                throw new SyntaxError(`Opened bracket "${openingBracket.payload}" has to be closed by the matching bracket. "${closingBracket.payload}" used at position ${closingBracket.position}.`);
            }
            return inside;
        }
        return this.text();
    }

    text(): Node {
        let text = this.tokens.peek();
        if (text.type === TokenType.TEXT) {
            let value = `${text.payload}`;
            this.tokens.next();
            let constant = this.knownConstants(value);
            if (constant !== null) {
                return constant;
            }
            let function1 = this.knownFunctions(value);
            if (function1 !== null) {
                return function1(this.expression());
            }
            let function2 = this.knownFunctions(value.substring(0, value.length - 1));
            if (function2 !== null) {
                let remaining = value.substring(value.length - 1);
                let constant = this.knownConstants(remaining);
                if (constant !== null) {
                    return function2(constant);
                }
                return function2(Variable(remaining));
            }
            return Variable(value);
        }
        return this.number();
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

    number(): Node {
        this.expect(TokenType.NUMBER);
        return Number(this.tokens.next().payload);
    }

}

export default function parseIt(input: Tokens): Node {
    return new Parser(input).parse();
}