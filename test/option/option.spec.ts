import { some, none, Option, isOption, ok, err } from "../../src";

describe("Options test", () => {
  const SOME_VALUE = 10;
  function returnsSomeValue(): Option<number> {
    return some(SOME_VALUE);
  }

  describe("Test isOption", () => {
    it("isOption should return true", () => {
      expect(isOption(some(2))).toBeTruthy();
    });

    it("isOption should return true", () => {
      expect(isOption(none)).toBeTruthy();
    });

    it("isOption should return false", () => {
      expect(isOption(2)).toBeFalsy();
    });

    it("isOption should return false", () => {
      expect(isOption(ok(2))).toBeFalsy();
    });

    it("isOption should return false", () => {
      expect(isOption(err("Error"))).toBeFalsy();
    });
  });

  describe("Test Some options", () => {
    it("unwrap should return", () => {
      const r = returnsSomeValue();

      expect(r.unwrap()).toBe(SOME_VALUE);
    });

    it("Should narrow", () => {
      const r = returnsSomeValue();

      expect(r.isSome()).toBeTruthy();
      if (r.isSome()) {
        expect(r.getValue()).toBe(SOME_VALUE);
      } else {
        r.unwrap();
      }
    });

    it("unwrapOr should return inner value", () => {
      const r = returnsSomeValue();

      expect(r.unwrapOr(2)).toBe(SOME_VALUE);
    });

    it("unwrapOrElse should return inner value", () => {
      const r = returnsSomeValue();

      expect(r.unwrapOrElse(() => 2)).toBe(SOME_VALUE);
    });

    it("map should transform with function", () => {
      const r = returnsSomeValue();

      const mapped = r.map((val) => val + 2);

      expect(mapped.unwrap()).toBe(SOME_VALUE + 2);
    });

    it("filter true should keep same", () => {
      const r = returnsSomeValue();

      const filtered = r.filter(() => true);

      expect(filtered.isSome()).toBeTruthy();
    });

    it("filter false should return none", () => {
      const r = returnsSomeValue();

      const filtered = r.filter(() => false);

      expect(filtered.isNone()).toBeTruthy();
    });

    it("zip with other Some should work", () => {
      const r = returnsSomeValue();
      const zipped = r.zip(some([2, 2]));

      expect(zipped.unwrap()[0]).toBe(SOME_VALUE);
      expect(zipped.unwrap()[1][0]).toBe(2);
      expect(zipped.unwrap()[1][1]).toBe(2);
    });

    it("zip with other None should return None", () => {
      const r = returnsSomeValue();
      const zipped = r.zip(none);

      expect(zipped.isNone()).toBeTruthy();
    });

    it("Should flatten to one level Option", () => {
      const r = some(some(SOME_VALUE));

      const flattened = r.flatten();

      expect(flattened.unwrap()).toBe(SOME_VALUE);
    });

    it("Should keep same level", () => {
      const r = some(SOME_VALUE);

      const flattened = r.flatten();

      expect(flattened.unwrap()).toBe(SOME_VALUE);
    });

    it("Should flatten to None", () => {
      const r = some(none);

      const flattened = r.flatten();

      expect(flattened.isNone()).toBeTruthy();
    });

    it("and() with Some(y) should return Some(y)", () => {
      const r = returnsSomeValue();

      const combined = r.and(some(2));

      expect(combined.unwrap()).toBe(2);
    });

    it("and() with None should return None", () => {
      const r = returnsSomeValue();

      const combined = r.and(none);

      expect(combined.isNone()).toBeTruthy();
    });

    it("or() with Some(y) should return Some(x)", () => {
      const r = returnsSomeValue();

      const combined = r.or(some("a") as Option<string>);

      expect(combined.unwrap()).toBe(SOME_VALUE);
    });

    it("or() with None should return Some(x)", () => {
      const r = returnsSomeValue();

      const combined = r.or(none);

      expect(combined.unwrap()).toBe(SOME_VALUE);
    });

    it("xor() with Some(y) should return None", () => {
      const r = returnsSomeValue();

      const combined = r.xor(some("a") as Option<string>);

      expect(combined.isNone()).toBeTruthy();
    });

    it("xor() with None should return Some(x)", () => {
      const r = returnsSomeValue();

      const combined = r.xor(none);

      expect(combined.unwrap()).toBe(SOME_VALUE);
    });
  });

  describe("Test None options", () => {
    function returnsNone(): Option<number> {
      return none;
    }

    it("Should throw on unwrap", () => {
      const r = returnsNone();

      expect(() => r.unwrap()).toThrow();
    });

    it("Should narrow", () => {
      const r = returnsNone();

      expect(r.isNone()).toBeTruthy();
      if (r.isNone()) {
      } else {
        r.getValue();
      }
    });

    it("unwrapOr should return provided val", () => {
      const r = returnsNone();

      expect(r.unwrapOr(2)).toBe(2);
    });

    it("unwrapOrElse should return provided function value", () => {
      const r = returnsNone();

      expect(r.unwrapOrElse(() => 2)).toBe(2);
    });

    it("map should return none", () => {
      const r = returnsNone();

      const mapped = r.map((val) => val + 2);

      expect(mapped.isNone()).toBeTruthy();
    });

    it("filter true should return none", () => {
      const r = returnsNone();

      const filtered = r.filter(() => true);

      expect(filtered.isNone()).toBeTruthy();
    });

    it("filter false should return none", () => {
      const r = returnsNone();

      const filtered = r.filter(() => false);

      expect(filtered.isNone()).toBeTruthy();
    });

    it("zip with other Some should work", () => {
      const r = returnsNone();
      const zipped = r.zip(some([2, 2]));

      expect(zipped.isNone()).toBeTruthy();
    });

    it("zip with other None should return None", () => {
      const r = returnsNone();
      const zipped = r.zip(none);

      expect(zipped.isNone()).toBeTruthy();
    });

    it("Should keep same level", () => {
      const r = none;

      const flattened = r.flatten();

      expect(flattened.isNone()).toBeTruthy();
    });

    it("and() with Some(y) should return None", () => {
      const r = returnsNone();

      const combined = r.and(some(2));

      expect(combined.isNone()).toBeTruthy();
    });

    it("and() with None should return None", () => {
      const r = returnsNone();

      const combined = r.and(none);

      expect(combined.isNone()).toBeTruthy();
    });

    it("or() with Some(y) should return Some(y)", () => {
      const r = returnsNone();

      const combined = r.or(some("a") as Option<string>);

      expect(combined.unwrap()).toBe("a");
    });

    it("or() with None should return None", () => {
      const r = returnsNone();

      const combined = r.or(none);

      expect(combined.isNone()).toBeTruthy();
    });

    it("xor() with Some(y) should return Some(y)", () => {
      const r = returnsNone();

      const combined = r.xor(some("a") as Option<string>);

      expect(combined.unwrap()).toBe("a");
    });

    it("xor() with None should return None", () => {
      const r = returnsNone();

      const combined = r.xor(none);

      expect(combined.isNone()).toBeTruthy();
    });
  });
});
