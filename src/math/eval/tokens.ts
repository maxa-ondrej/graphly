/**
 * Enum of all possible types of tokens.
 */
export enum TokenType {
    NUMBER = "NUMBER",
    TEXT = "TEXT",
    PLUS = "PLUS",
    MINUS = "MINUS",
    TIMES = "TIMES",
    OBELUS = "OBELUS",
    POWER = "POWER",
    OPEN_BRACKET = "OPEN_BRACKET",
    CLOSE_BRACKET = "CLOSE_BRACKET",
    EOF = "EOF"
}

/**
 * Detects type of the given bracket.
 *
 * @param bracket
 */
export function getBracketCode(bracket: string) {
    switch (bracket) {
        case '(':
        case ')':
            return 1;
        case '{':
        case '}':
            return 2;
        case '[':
        case ']':
            return 3;
        case '<':
        case '>':
            return 4;
        default:
            throw new Error('Bracket not registered in our database!');
    }
}

/**
 * Ancestor for all tokens
 */
export interface Token<P = null> {
    type: TokenType,
    position: number,
    payload: P,
}

/**
 * Queue of tokens.
 */
export class Tokens {
    tokens: Token<any>[];

    constructor(tokens: Token<any>[]) {
        this.tokens = [...tokens];
    }

    peek() {
        return this.tokens[0];
    }

    prepend(...token: Token<any>[]) {
        this.tokens.unshift(...token);
    }

    next() {
        let token = this.tokens.shift();
        if (token === undefined) {
            throw new Error('End of tokens!');
        }
        return token;
    }
}

export const Number = (position: number, value: number): Token<number> => ({type: TokenType.NUMBER, payload: value, position});
export const Text = (position: number, value: string): Token<string> => ({type: TokenType.TEXT, payload: value, position});
export const Plus = (position: number): Token => ({type: TokenType.PLUS, payload: null, position});
export const Minus = (position: number): Token => ({type: TokenType.MINUS, payload: null, position});
export const Times = (position: number): Token => ({type: TokenType.TIMES, payload: null, position});
export const Obelus = (position: number): Token => ({type: TokenType.OBELUS, payload: null, position});
export const Power = (position: number): Token => ({type: TokenType.POWER, payload: null, position});
export const OpenBracket = (position: number, variant: string): Token<string> => ({type: TokenType.OPEN_BRACKET, payload: variant, position});
export const CloseBracket = (position: number, variant: string): Token<string> => ({type: TokenType.CLOSE_BRACKET, payload: variant, position});
export const Eof = (position: number): Token => ({type: TokenType.EOF, payload: null, position});