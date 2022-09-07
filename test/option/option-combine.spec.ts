import { some, allOptions, none, anyOptions } from "../../src";

describe("Option combination test", () => {
  describe("Test allOptions", () => {
    it("allOptions should return combined of Some", () => {
      const opt1 = some(1);
      const opt2 = some(["a"]);

      const r = allOptions(opt1, opt2);

      expect(r.isSome()).toBeTruthy();
      if (r.isSome()) {
        const [a, b] = r.getValue();

        expect(a).toBe(1);
        expect(b[0]).toBe("a");
      }
    });

    it("allOptions of [some, none] should return none", () => {
      const opt1 = some(1);
      const opt2 = none();

      const r = allOptions(opt1, opt2);

      expect(r.isNone()).toBeTruthy();
    });

    it("allOptions of [none, some] should return none", () => {
      const opt1 = some(1);
      const opt2 = none();

      const r = allOptions(opt2, opt1);

      expect(r.isNone()).toBeTruthy();
    });

    it("allOptions of [none, none] should return none", () => {
      const opt1 = none();
      const opt2 = none();

      const r = allOptions(opt2, opt1);

      expect(r.isNone()).toBeTruthy();
    });
  });

  describe("Test anyOptions", () => {
    it("allOptions should return first Some", () => {
      const opt1 = some(1);
      const opt2 = some(["a"]);

      const r = anyOptions(opt1, opt2);

      expect(r.isSome()).toBeTruthy();
      if (r.isSome()) {
        const val = r.getValue();

        expect(val).toBe(1);
      }
    });

    it("allOptions of [some, none] should return some", () => {
      const opt1 = some(1);
      const opt2 = none();

      const r = anyOptions(opt1, opt2);

      expect(r.isSome()).toBeTruthy();
      if (r.isSome()) {
        const val = r.getValue();

        expect(val).toBe(1);
      }
    });

    it("allOptions of [none, some] should return some", () => {
      const opt1 = some(1);
      const opt2 = none();

      const r = anyOptions(opt2, opt1);

      expect(r.isSome()).toBeTruthy();
      if (r.isSome()) {
        const val = r.getValue();

        expect(val).toBe(1);
      }
    });

    it("allOptions of [none, none] should return none", () => {
      const opt1 = none();
      const opt2 = none();

      const r = anyOptions(opt2, opt1);

      expect(r.isNone()).toBeTruthy();
    });
  });
});
