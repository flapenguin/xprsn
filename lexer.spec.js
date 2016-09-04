const assert = require('assert');
const Lexer = require('./lexer');

describe('Lexer', () => {
  function tok(type, value) {
    return { type: type, value: value };
  }

  const eof = tok('EOF');
  const tokens = [tok(0), tok(1), tok(2), tok(3)];

  it('should produce infinitly many eofs', () => {
    const lexer = new Lexer([], eof);

    assert.strictEqual(lexer.consume(), eof);
    assert.strictEqual(lexer.consume(), eof);
    assert.strictEqual(lexer.consume(), eof);
  });

  it('should consume tokens in order', () => {
    const lexer = new Lexer(tokens, eof);

    const result = [];
    while (true) {
      const tok = lexer.consume();
      if (tok === eof) {
        break;
      }

      result.push(tok);
    }

    assert.deepStrictEqual(result, tokens);
  });

  it('should peek next tokens', () => {
    const lexer = new Lexer(tokens, eof);

    assert.strictEqual(lexer.peek(), tokens[0]);
    assert.strictEqual(lexer.peek(2), tokens[2]);
    assert.strictEqual(lexer.peek(1), tokens[1]);
  });

  it('should skip specified number of tokens', () => {
    const lexer = new Lexer(tokens, eof);

    lexer.skip(2);

    assert.strictEqual(lexer.consume(), tokens[2]);
  });

  it('should read each token only once with no reading ahead', () => {
    const last = tok('last');

    let rounds = 0;
    function* tokenStream() {
      for (let tok of tokens.concat([last])) {
        rounds++;
        yield tok;
      }
    }

    const lexer = new Lexer(tokenStream, eof);
    assert.strictEqual(rounds, 0);

    const peeked1 = lexer.peek(1);
    assert.strictEqual(peeked1, tokens[1]);
    assert.strictEqual(rounds, 2);

    const peeked0 = lexer.peek(0);
    assert.strictEqual(peeked0, tokens[0]);
    assert.strictEqual(rounds, 2);

    const consumed0 = lexer.consume();
    assert.strictEqual(consumed0, tokens[0]);
    assert.strictEqual(rounds, 2);

    lexer.skip(1);
    assert.strictEqual(rounds, 2);

    const consumed2 = lexer.consume();
    assert.strictEqual(consumed2, tokens[2]);
    assert.strictEqual(rounds, 3);
  });
});
