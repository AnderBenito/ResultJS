import { error, ok, Result } from "../../src";

describe("Result test", () => {
  describe("Test OK Result", () => {
    function returnsAOKResult(): Result<number> {
      return ok(10);
    }

    it("Should narrow the result", () => {
      const r = returnsAOKResult();

      if (r.isOk()) {
        expect(r.getValue()).toBe(10);
      } else {
        r.unwrap();
        r.getErr();
      }
    });
    it("Should unwrap correctly", () => {
      const r = returnsAOKResult();

      expect(r.unwrap()).toBe(10);
    });

    it("Should unwrap or correctly", () => {
      const r = returnsAOKResult();

      expect(r.unwrapOr(3)).toBe(10);
    });

    it("Should unwrapOrElse correctly", () => {
      const r = returnsAOKResult();

      expect(r.unwrapOrElse(() => 2)).toBe(10);
    });

    it("Should map correctly", () => {
      const r = returnsAOKResult();

      expect(r.map((val) => val + 1).unwrap()).toBe(11);
    });

    it("Should mapErr correctly", () => {
      const r = returnsAOKResult();

      expect(
        r.mapErr((err) => new Error(err.message + "New error")).unwrap()
      ).toBe(10);
    });
  });

  describe("Test Error Result", () => {
    class CustomError extends Error {}
    function returnsAErrorResult(): Result<number> {
      return error(new CustomError("Invalid result"));
    }

    it("Should narrow the result to err", () => {
      const r = returnsAErrorResult();

      if (r.isErr()) {
        expect(r.getErr().message).toBe("Invalid result");
      } else {
        r.getValue();
      }
    });

    it("Should unwrap and throw", () => {
      const r = returnsAErrorResult();

      expect(() => r.unwrap()).toThrow();
    });

    it("Should unwrap and throw", () => {
      const r = returnsAErrorResult();

      expect(r.unwrapOr(2)).toBe(2);
    });

    it("Should unwrapOrElse correctly", () => {
      const r = returnsAErrorResult();

      expect(r.unwrapOrElse(() => 2)).toBe(2);
    });

    it("Should map correctly", () => {
      const r = returnsAErrorResult();

      expect(() => r.map((val) => val + 1).unwrap()).toThrow(CustomError);
    });

    it("Should mapErr correctly", () => {
      const r = returnsAErrorResult();

      expect(() =>
        r.mapErr((err) => new Error(err.message + "New error")).unwrap()
      ).toThrow();
    });
  });
});
