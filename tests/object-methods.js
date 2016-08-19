const { describe, it } = global;
const chai = require('chai');
const { expect } = chai;

const { merge } = require('../lib/object-methods');

describe('object-methods', () => {
  it('{a: "b"} merge {a: "c"} results in {a: "c"}', () => {
    const result = merge({ a: 'b' }, { a: 'c' });
    expect(result).to.deep.equal({ a: 'c' });
  });

  it('{a: "b"} merge {b: "c"} results in {a: "b", b: "c"}', () => {
    const result = merge({ a: 'b' }, { b: 'c' });
    expect(result).to.deep.equal({ a: 'b', b: 'c' });
  });

  it('{a: { b: "c" }, e: "f" } merge {a: { b: "d" }} results in {a: { b: "d" }, e: "f"}', () => {
    const result = merge({ a: { b: 'c' }, e: 'f' }, { a: { b: 'd' } });
    expect(result).to.deep.equal({ a: { b: 'd' }, e: 'f' });
  });

  it('{a: [1,2]} merge {a: [3,4]} results in {a: [3,4]}', () => {
    const result = merge({ a: [1, 2] }, { a: [3, 4] });
    expect(result).to.deep.equal({ a: [3, 4] });
  });

  it(
    '{a: { b: "c" }, d: "e"} merge {a: { b: "f" }, d: "g" } ' +
    'results in { a: { b: { n: "o" } }, d: "g", j: "k", l: "m" }'
    , () => {
    const result = merge(
      { a: { b: 'c' }, d: 'e', j: 'k' },
      { a: { b: { n: 'o' } }, d: 'g', l: 'm' });
    expect(result).to.deep.equal(
      { a: { b: { n: 'o' } }, d: 'g', j: 'k', l: 'm' }
    );
  });
});
