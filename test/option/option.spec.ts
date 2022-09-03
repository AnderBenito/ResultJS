import { some, none, Option, ok } from "../../src";

describe("Options test", () => {
  describe("Test Some options", () => {
    function returnsASomeOption(): Option<number> {
      return some(10);
    }

    it("Should work", () => {
      const r = returnsASomeOption();

      expect(r.unwrap()).toBe(10);
    });

    it("Should narrow", () => {
      const r = returnsASomeOption();

      if (r.isNone()) {
        r.unwrap();
      } else {
        expect(r.getValue()).toBe(10);
      }
    });

    it("Should work", () => {
      const r = returnsASomeOption();

      expect(r.unwrapOr(2)).toBe(10);
    });

    it("Should work", () => {
      const r = returnsASomeOption();

      expect(r.unwrapOrElse(() => 2)).toBe(10);
    });

    it("Should work", () => {
      const r = returnsASomeOption();
      const zipped = r.zip(some([2, 2]));

      expect(zipped.unwrap()[0]).toBe(10);
      expect(zipped.unwrap()[1]).toBe(10);
    });
  });

  describe("Test None options", () => {
    function returnsANoneOption(): Option<number> {
      return none;
    }

    it("Should work", () => {
      const r = returnsANoneOption();

      expect(() => r.unwrap()).toThrow();
    });

    it("Should narrow", () => {
      const r = returnsANoneOption();

      if (r.isSome()) {
        r.getValue();
      } else {
        expect(r.isNone()).toBe(true);
      }
    });

    it("Should work", () => {
      const r = returnsANoneOption();

      expect(r.unwrapOr(2)).toBe(2);
    });
  });
});
