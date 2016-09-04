interface Token<TokenType> {
  type: TokenType
}

interface Expression {
}

interface Lexer<Token> {
  consume(): Token;
  skip(n?: number): void;
  peek(n?: number): Token;
}

interface PrefixRuleSet<TokenType> {
  [tokenType: string]: {
    precedence: number;
    parse(token: TokenType, parser: Parser<TokenType>, precedence: number): Expression;
  };
}

interface PostfixRuleSet<TokenType> {
  [tokenType: string]: {
    precedence: number;
    parse(token: TokenType, expr: Expression, parser: Parser<TokenType>, precedence: number): Expression;
  };
}

interface ParserRules<TokenType> {
  prefix: PrefixRuleSet<TokenType>;
  postfix: PostfixRuleSet<TokenType>;
}

declare class Parser<TokenType> {
  constructor(lexer: Lexer<Token<TokenType>>, rules: ParserRules<TokenType>);

  lexer: Lexer<TokenType>;
}

export = Parser;
