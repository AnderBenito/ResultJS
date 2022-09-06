import {
  error,
  none,
  ok,
  Option,
  Result,
  some,
  transposeResult,
} from "../../src";

describe("Result test", () => {
  const OK_VALUE = 10;
  function returnsOk(): Result<number> {
    return ok(OK_VALUE);
  }
  describe("Test OK Result", () => {
    it("isOk should be true", () => {
      const r = returnsOk();

      expect(r.isOk()).toBeTruthy();
    });

    it("Should narrow the result", () => {
      const r = returnsOk();

      if (r.isOk()) {
        expect(r.getValue()).toBe(OK_VALUE);
      } else {
        r.unwrap();
        r.getErr();
      }
    });

    it("unwrap should return Ok value", () => {
      const r = returnsOk();

      expect(r.unwrap()).toBe(OK_VALUE);
    });

    it("unwrapOr should return Ok value", () => {
      const r = returnsOk();

      expect(r.unwrapOr(3)).toBe(OK_VALUE);
    });

    it("unwrapOrElse should return Ok value", () => {
      const r = returnsOk();

      expect(r.unwrapOrElse(() => 2)).toBe(OK_VALUE);
    });

    it("map should apply transform function", () => {
      const r = returnsOk();

      expect(r.map((val) => val + 1).unwrap()).toBe(OK_VALUE + 1);
    });

    it("mapErr should keep Ok unchanged", () => {
      const r = returnsOk();

      expect(
        r.mapErr((err) => new Error(err.message + "New error")).unwrap()
      ).toBe(OK_VALUE);
    });

    it("and() with Ok(y) should return Ok(y)", () => {
      const r = returnsOk();

      const combined = r.and(ok(3) as Result<number>);

      expect(combined.unwrap()).toBe(3);
    });

    it("and() with Err(d) should return Err(d)", () => {
      const r: Result<number> = returnsOk();

      const combined = r.and(error(new Error("2")) as Result<number>);

      expect(combined.isErr()).toBeTruthy();
      if (combined.isErr()) {
        expect(combined.getErr().message).toBe("2");
      }
    });

    it("or() with Ok(y) should return Ok(x)", () => {
      const r = returnsOk();

      const combined = r.or(ok(3) as Result<number>);

      expect(combined.unwrap()).toBe(OK_VALUE);
    });

    it("or() with Err(e) should return Ok(x)", () => {
      const r = returnsOk();

      const combined = r.or(ok(3) as Result<number>);

      expect(combined.unwrap()).toBe(OK_VALUE);
    });

    it("ok() should transform to Some<T>", () => {
      const r = returnsOk();

      expect(r.ok().isSome()).toBeTruthy();
    });

    it("err() should transform to None", () => {
      const r = returnsOk();

      expect(r.err().isNone()).toBeTruthy();
    });

    it("transposeResult() should transform to Some(Ok(_))", () => {
      const r: Result<Option<number>> = ok(some(OK_VALUE));

      const transposed = transposeResult(r);

      expect(transposed.isSome()).toBeTruthy();
      expect(transposed.unwrap().isOk()).toBeTruthy();
      expect(transposed.unwrap().unwrap()).toBe(OK_VALUE);
    });

    it("transposeResult() should transform to None", () => {
      const r: Result<Option<number>> = ok(none);

      const transposed = transposeResult(r);

      expect(transposed.isNone()).toBeTruthy();
    });
  });

  describe("Test Error Result", () => {
    class CustomError extends Error {}
    function returnsErr(): Result<number, CustomError> {
      return error(new CustomError("Invalid Result"));
    }

    it("isErr should be true", () => {
      const r = returnsErr();

      expect(r.isErr()).toBeTruthy();
    });

    it("Should narrow the result", () => {
      const r = returnsErr();

      if (r.isErr()) {
        expect(r.getErr()).toBeInstanceOf(CustomError);
      } else {
        r.unwrap();
        r.getValue();
      }
    });

    it("unwrap should throw Err", () => {
      const r = returnsErr();

      expect(() => r.unwrap()).toThrow(CustomError);
    });

    it("unwrapOr should return provided value", () => {
      const r = returnsErr();

      expect(r.unwrapOr(3)).toBe(3);
    });

    it("unwrapOrElse should return function return value", () => {
      const r = returnsErr();

      expect(r.unwrapOrElse(() => 2)).toBe(2);
    });

    it("map should keep unchanged and throw", () => {
      const r = returnsErr();

      expect(() => r.map((val) => val + 1).unwrap()).toThrow(CustomError);
    });

    it("mapErr should transform error", () => {
      const r = returnsErr();
      const newMessage = "HELLO";

      const mapped = r.mapErr((err) => new Error(err.message + newMessage));

      expect(mapped.isErr()).toBeTruthy();
      if (mapped.isErr()) {
        expect(mapped.getErr().message).toBe("Invalid Result" + newMessage);
      }
    });

    it("and() with Ok(y) should return Err(e)", () => {
      const r = returnsErr();

      const combined = r.and(ok(3) as Result<number>);

      expect(() => combined.unwrap()).toThrow(CustomError);
    });

    it("and() with Err(d) should return Err(e)", () => {
      const r = returnsErr();

      const combined = r.and(error(new Error("2")) as Result<number>);

      expect(combined.isErr()).toBeTruthy();
      if (combined.isErr()) {
        expect(combined.getErr().message).toBe("Invalid Result");
      }
    });

    it("or() with Ok(y) should return Ok(y)", () => {
      const r = returnsErr();

      const combined = r.or(ok(3) as Result<number>);

      expect(combined.unwrap()).toBe(3);
    });

    it("or() with Err(d) should return Err(d)", () => {
      const r = returnsErr();

      const combined = r.or(error(new Error("2")) as Result<number>);

      expect(combined.isErr()).toBeTruthy();
      if (combined.isErr()) {
        expect(combined.getErr().message).toBe("2");
      }
    });

    it("ok() should transform to None", () => {
      const r = returnsErr();

      expect(r.ok().isNone()).toBeTruthy();
    });

    it("err() should transform to Some<E>", () => {
      const r = returnsErr();

      expect(r.err().isSome()).toBeTruthy();
    });

    it("transposeResult() should transform to Some(Ok(_))", () => {
      const r: Result<Option<number>> = error(new Error());

      const transposed = transposeResult(r as Result<Option<number>>);

      expect(transposed.isSome()).toBeTruthy();
      expect(transposed.unwrap().isErr()).toBeTruthy();
      expect(() => transposed.unwrap().unwrap()).toThrow(Error);
    });
  });
});
