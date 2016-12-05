import { merge } from '../index';

describe('object-methods', () => {
  it('{a: "b"} merge {a: "c"} results in {a: "c"}', () => {
    const result = merge({ a: 'b' }, { a: 'c' });
    expect(result).toEqual({ a: 'c' });
  });

  it('{a: "b"} merge {b: "c"} results in {a: "b", b: "c"}', () => {
    const result = merge({ a: 'b' }, { b: 'c' });
    expect(result).toEqual({ a: 'b', b: 'c' });
  });

  it('{a: { b: "c" }, e: "f" } merge {a: { b: "d" }} results in {a: { b: "d" }, e: "f"}', () => {
    const result = merge({ a: { b: 'c' }, e: 'f' }, { a: { b: 'd' } });
    expect(result).toEqual({ a: { b: 'd' }, e: 'f' });
  });

  it('{a: [1,2]} merge {a: [3,4]} results in {a: [3,4]}', () => {
    const result = merge({ a: [1, 2] }, { a: [3, 4] });
    expect(result).toEqual({ a: [3, 4] });
  });

  it(
    '{a: { b: "c" }, d: "e"} merge {a: { b: "f" }, d: "g" } ' +
    'results in { a: { b: { n: "o" } }, d: "g", j: "k", l: "m" }'
    , () => {
    const result = merge(
      { a: { b: 'c' }, d: 'e', j: 'k' },
      { a: { b: { n: 'o' } }, d: 'g', l: 'm' });
    expect(result).toEqual(
      { a: { b: { n: 'o' } }, d: 'g', j: 'k', l: 'm' }
    );
  });
});