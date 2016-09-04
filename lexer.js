/**
 * Lexer with lookahead support. Tokens can be of any type.
 */
class Lexer {
  /**
   * @param tokens {function|Token[]} - generator of tokens
   * @param eof {Token}
   */
  constructor(tokens, eof) {
    if (Array.isArray(tokens)) {
      const tokensArray = tokens;
      tokens = function*() { yield* tokensArray; };
    }
    this.it = tokens();
    this.eof = eof;
    this.lookahead = [];
  }

  _next() {
    const next = this.it.next();
    if (next.done) {
      return this.eof;
    }

    return next.value;
  }

  /**
   * Peeks next token in the stream withotu consuming it.
   * @param n {number} 0-based index of token after current one to peek
   * @return {Token}
   */
  peek(n) {
    n = n || 0;

    for (let i = n - this.lookahead.length; i >= 0; i--) {
      const val = this._next();
      this.lookahead.push(val);
    }

    return this.lookahead[n];
  }

  /**
   * Skips specified number of tokens.
   * @param n {number} how much tokens to skip
   */
  skip(n) {
    n = n || 1;

    const peeked = Math.min(this.lookahead.length, n);
    this.lookahead = this.lookahead.slice(peeked);

    let left = n - peeked;
    while (left-- > 0) {
      this._next();
    }
  }

  /**
   * Consumes tokens until predicate is satisfied.
   * @param predicate {function}
   * @param include {boolean} whether to include token which satisfied predicate
   * @return {Token[]}
   */
  consumeUntil(predicate, include) {
    const toks = [];
    while (true) {
      const tok = this.peek();
      if (predicate(tok)) {
        if (include) {
          this.skip();
          toks.push(tok);
        }

        break;
      }

      this.skip();
      toks.push(tok);
    }

    return toks;
  }

  /**
   * Consumes next token in the stream.
   * @return {Token}
   */
  consume() {
    if (this.lookahead.length) {
      const tok = this.lookahead[0];
      this.lookahead = this.lookahead.slice(1);

      return tok;
    }

    return this._next();
  }
}

module.exports = Lexer;
