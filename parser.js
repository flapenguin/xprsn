/**
 * Top down operator precedence parser (aka Pratt parser).
 */
class Parser {
  constructor(lexer, rules) {
    this.lexer = lexer;
    this.rules = rules;
  }

  parse() {
    const tok = this.lexer.consume();

    const rule = this.rules.find(x => x.tokenType === tok.type);
    if (!rule) {
      throw new Error(`Parslet is not found for token type ${tok.type}`);
    }

    return rule.parse(tok, this);
  }
}

module.exports = Parser;
