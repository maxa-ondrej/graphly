import {CloseBracket, Eof, Minus, Number, Obelus, OpenBracket, Plus, Power, Text, Times, Token, Tokens} from "./tokens";

/**
 * Convert a string (more specifically the first character) to Char Code.
 *
 * @param char
 */
export const toChar = (char: any): number => `${char}`.charCodeAt(0);

/**
 * Thrown when an error occurs while lexing.
 */
export class LexingError extends Error {
    constructor(input: string, position: number) {
        super(`Unexpected input "${input}" at position ${position}`);
    }
}

/**
 * The almighty lexer itself. Turns a string into an array of tokens.
 */
export class Lexer {

    /**
     * The index of currently viewed character.
     */
    pointer: number = 0;
    /**
     * The whole input string.
     */
    input: string;
    /**
     * Result array of tokens.
     */
    tokens = new Array<Token<any>>();

    constructor(input: string) {
        this.input = input + ' ';
    }

    /**
     * The main function for lexing.
     */
    lexIt() {
        while (this.pointer < this.input.length) {
            if (this.isNumber) {
                this.tokens.push(this.number);
                continue;
            }
            if (this.isText) {
                this.tokens.push(this.text);
                continue;
            }
            let singleToken = this.peekSingleToken();
            if (singleToken !== null) {
                this.tokens.push(singleToken);
                this.pointer++;
            } else if (this.char.trim() === '') {
                this.pointer++;
            } else {
                this.errorIf(true);
            }
        }
        this.tokens.push(Eof(this.pointer))
    }

    /**
     * Gets the current character (as a string)
     */
    get char(): string {
        return this.input.charAt(this.pointer);
    }

    /**
     * Checks if the current character is a number (using char codes).
     */
    get isNumber(): boolean {
        const c = this.input.charCodeAt(this.pointer);
        return c >= toChar(0) && c <= toChar(9);
    }

    /**
     * Load following characters into a Number Token.
     */
    get number(): Token<number> {
        let isDecimal = false;
        let number = '';
        while (this.pointer < this.input.length) {
            const char = this.char;
            if (this.isNumber) {
                number += char;
            } else if (['.', ','].includes(char)) {
                this.errorIf(isDecimal);
                number += '.';
                isDecimal = true;
            } else {
                break;
            }
            this.pointer++;
        }
        return Number(this.pointer - number.length, number.includes('.') ? parseFloat(number) : parseInt(number));
    }

    /**
     * Checks if the current character is a text [a-zA-Z] (using char codes).
     */
    get isText(): boolean {
        const c = this.input.charCodeAt(this.pointer);
        return (c >= toChar('a') && c <= toChar('z')) || (c >= toChar('A') && c <= toChar('Z'));
    }

    /**
     * Load following characters into a Text Token.
     */
    get text(): Token<string> {
        let text = '';
        while (this.pointer < this.input.length) {
            const char = this.char;
            if (this.isText) {
                text += char;
                this.pointer++;
                continue
            }
            break;
        }
        return Text(this.pointer - text.length, text);
    }

    /**
     * Handle all single tokens.
     */
    peekSingleToken(): Token<any> | null {
        switch (this.char) {
            case '+':
                return Plus(this.pointer);
            case '-':
                return Minus(this.pointer);
            case '*':
                return Times(this.pointer);
            case '/':
                return Obelus(this.pointer);
            case '^':
                return Power(this.pointer);
            case '(':
            case '[':
            case '{':
            case '<':
                return OpenBracket(this.pointer, this.char);
            case ')':
            case ']':
            case '}':
            case '>':
                return CloseBracket(this.pointer, this.char);
            default:
                return null;
        }

    }

    /**
     * Check and throw an error.
     *
     * @param condition if true, an error is thrown
     */
    errorIf(condition: boolean) {
        if (condition) {
            throw new LexingError(this.input.charAt(this.pointer), this.pointer);
        }
    }
}

/**
 * Turns provided string into an array of tokens.
 *
 * @param input the input string
 */
export default function lexIt(input: string): Tokens {
    const lexer = new Lexer(input);
    lexer.lexIt();
    return new Tokens(lexer.tokens);
}
