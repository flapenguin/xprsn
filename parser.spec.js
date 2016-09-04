const assert = require('assert');
const Lexer = require('./lexer');
const Parser = require('./parser');

function tok(type, text) {
  return { type: type, text: text };
}

const eof = tok('EOF');

describe('Parser', () => {
  it('should parse single token', () => {
    const lexer = new Lexer([tok('integer', '42')], eof);
    const parser = new Parser(lexer, [
      { tokenType: 'integer', parse: (tok, parser) => ({ type: 'literal', value: Number.parseInt(tok.text, 10) }) }
    ]);

    assert.deepStrictEqual(parser.parse(), { type: 'literal', value: 42 });
  });
});
