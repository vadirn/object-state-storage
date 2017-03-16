import { merge } from '../index';

describe('merge', () => {
  it('does not mutate arguments', () => {
    const mutable = { foo: 'bar' };
    const target = { test: mutable };
    const result = merge(target, { test: { foo: 'foo' } });
    expect(target).toEqual({ test: { foo: 'bar' } });
    expect(mutable).toEqual({ foo: 'bar' });
    expect(result).toEqual({ test: { foo: 'foo' } });
  });

  it('assinging undefined value does not change value', () => {
    const a = { a: 'b' };
    const b = { a: undefined };
    expect(merge(a, b)).toEqual({ a: 'b' });
  });

  it('assigning empty object keeps target value unchanged', () => {
    const a = { a: { b: 'c' } };
    const b = { a: {} };
    expect(merge(a, b)).toEqual({ a: { b: 'c' } });
  });

  it('keeps unmodified values', () => {
    const a = { a: { b: 'c', d: 'e' } };
    const b = { a: { f: 'g' } };
    expect(merge(a, b)).toEqual({ a: { b: 'c', d: 'e', f: 'g' } });
  });

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
      'results in { a: { b: { n: "o" } }, d: "g", j: "k", l: "m" }',
    () => {
      const result = merge({ a: { b: 'c' }, d: 'e', j: 'k' }, { a: { b: { n: 'o' } }, d: 'g', l: 'm' });
      expect(result).toEqual({ a: { b: { n: 'o' } }, d: 'g', j: 'k', l: 'm' });
    }
  );
});
