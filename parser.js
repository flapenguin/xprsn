/**
 * Top down operator precedence parser (aka Pratt parser).
 */
class Parser {
  constructor(lexer, rules) {
    this.lexer = lexer;
    this.prefix = rules.prefix || {};
    this.postfix = rules.postfix || {};
  }

  /**
   * Parses expression as part of expression with higher precedence (default 0).
   */
  parse(precedence) {
    precedence = precedence || 0;

    const tok = this.lexer.consume();
    const prefixRule = this.prefix[tok.type];
    if (!prefixRule) {
      throw new Error(`Parslet is not found for token type ${tok.type}`);
    }

    let expr = prefixRule.parse(tok, this, prefixRule.precedence);

    while (true) {
      const tok = this.lexer.peek();
      const rule = this.postfix[tok.type];

      if (!rule || precedence >= rule.precedence) {
        break;
      }

      this.lexer.skip();
      expr = rule.parse(tok, expr, this, rule.precedence);
    }

    return expr;
  }
}

module.exports = Parser;
