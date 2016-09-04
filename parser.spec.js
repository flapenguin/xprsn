const assert = require('assert');
const Lexer = require('./lexer');
const Parser = require('./parser');

function tok(type, text) {
  return { type: type, text: text };
}

function idast(text) {
  return { type: 'identifier', name: text };
}

const eoftok = tok('EOF');
const assigntok = tok('=', '=');
const plustok = tok('+', '+');
const inversetok = tok('~', '~');
const minustok = tok('-', '-');
const idtok = id => tok('id', id);

describe('Parser', () => {
  it('should parse chained infix operators', () => {
    const lexer = new Lexer([
      inversetok, minustok, inversetok, minustok, minustok, idtok('foobar')
    ], eoftok);

    const parser = new Parser(lexer, {
      prefix: {
        '-': {
          precedence: 2,
          parse: (tok, parser, precedence) => ({ type: 'negate', expr: parser.parse(precedence) })
        },
        '~': {
          precedence: 2,
          parse: (tok, parser, precedence) => ({ type: 'inverse', expr: parser.parse(precedence) })
        },
        'id': {
          precedence: 1,
          parse: (tok, parser, precedence) => idast(tok.text)
        }
      }
    });

    assert.deepStrictEqual(parser.parse(), {
      type: 'inverse',
      expr: {
        type: 'negate',
        expr: {
          type: 'inverse',
          expr: {
            type: 'negate',
            expr: {
              type: 'negate',
              expr: idast('foobar')
            }
          }
        }
      }
    });
  });

  it('should not confuse infix and prefix', () => {
    const lexer = new Lexer([
       minustok, idtok('foo'), minustok, minustok, idtok('bar')
    ], eoftok);

    const parser = new Parser(lexer, {
      prefix: {
        '-': {
          precedence: 3,
          parse: (tok, parser, precedence) => ({ type: 'negate', expr: parser.parse(precedence) })
        },
        'id': {
          precedence: 2,
          parse: (tok, parser, precedence) => idast(tok.text)
        }
      },
      postfix: {
        '-': {
          precedence: 1,
          parse: (tok, expr, parser, precedence) => ({ type: 'sub', lhs: expr, rhs: parser.parse(precedence) })
        }
      }
    });

    assert.deepStrictEqual(parser.parse(), {
      type: 'sub',
      lhs: {
        type: 'negate',
        expr: idast('foo')
      },
      rhs: {
        type: 'negate',
        expr: idast('bar')
      }
    });
  });

  it('should parse infix operations according to precedence', () => {
    const lexer = new Lexer([
      idtok('a'), plustok, idtok('b'),
      assigntok,
      idtok('c'), plustok, idtok('d')
    ], eoftok);

    const parser = new Parser(lexer, {
      prefix: {
        'id': {
          parse: (tok, parser) => idast(tok.text),
          precedence: 9
        }
      },
      postfix: {
        '=': {
          precedence: 2,
          parse: (tok, expr, parser, precedence) => ({ type: 'assign', lhs: expr, rhs: parser.parse(precedence) })
        },
        '+': {
          precedence: 3,
          parse: (tok, expr, parser, precedence) => ({ type: 'sum', lhs: expr, rhs: parser.parse(precedence) })
        }
      }
    });

    assert.deepStrictEqual(parser.parse(), {
      type: 'assign',
      lhs: {
        type: 'sum',
        lhs: idast('a'),
        rhs: idast('b')
      },
      rhs: {
        type: 'sum',
        lhs: idast('c'),
        rhs: idast('d')
      }
    });
  });
});
