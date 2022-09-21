import {
  err,
  isResult,
  none,
  ok,
  Option,
  Result,
  ResultPromise,
  some,
  transposeResult,
} from "../../src";

describe("ResultPromise test", () => {
  const OK_VALUE = 10;
  function returnsOk(): Result<number, Error> {
    return ok(OK_VALUE);
  }

  describe("Test OK Result", () => {
    it("andThenAsync should give a ResultPromise", async () => {
      const r = returnsOk();
      const pro = r.andThenAsync(
        async (val) => ok(val + 1) as Result<number, Error>
      );

      expect(pro).toBeInstanceOf(ResultPromise);
      expect(await pro.unwrap()).toBe(OK_VALUE + 1);
    });

    it("orElseAsync should give a ResultPromise", async () => {
      const r = returnsOk();
      const pro = r.orElseAsync(
        async () => ok(OK_VALUE) as Result<number, Error>
      );

      expect(pro).toBeInstanceOf(ResultPromise);
      expect(await pro.unwrap()).toBe(OK_VALUE);
    });

    it("unwrap", async () => {
      const r = returnsOk();
      const pro = await r.andThenAsync(async (val) => ok(val + 1)).unwrap();

      expect(pro).toBe(OK_VALUE + 1);
    });

    it("unwrapOr", async () => {
      const r = returnsOk();
      const pro = await r.andThenAsync(async (val) => ok(val + 1)).unwrapOr(0);

      expect(pro).toBe(OK_VALUE + 1);
    });

    it("unwrapOrElse", async () => {
      const r = returnsOk();
      const pro = await r
        .andThenAsync(async (val) => ok(val + 1))
        .unwrapOrElse(() => 0);

      expect(pro).toBe(OK_VALUE + 1);
    });

    it("map", async () => {
      const r = returnsOk();
      const pro = await r
        .andThenAsync(async (val) => ok(val + 1))
        .map((val) => val * 2);

      expect(pro.unwrap()).toBe((OK_VALUE + 1) * 2);
    });

    it("mapErr", async () => {
      const r = returnsOk();
      const pro = await r
        .andThenAsync(async (val) => ok(val + 1) as Result<number, Error>)
        .mapErr((err) => err);

      expect(pro.unwrap()).toBe(OK_VALUE + 1);
    });

    it("err", async () => {
      const r = returnsOk();
      const pro = await r
        .andThenAsync(async (val) => ok(val + 1) as Result<number, Error>)
        .err();

      expect(pro.isNone()).toBeTruthy();
    });

    it("ok", async () => {
      const r = returnsOk();
      const pro = await r
        .andThenAsync(async (val) => ok(val + 1) as Result<number, Error>)
        .ok();

      expect(pro.isSome()).toBeTruthy();
      expect(pro.unwrap()).toBe(OK_VALUE + 1);
    });

    it("and", async () => {
      const r = returnsOk();
      const pro = await r
        .andThenAsync(async (val) => ok(val + 1) as Result<number, Error>)
        .and(ok(3));

      expect(pro.isOk()).toBeTruthy();
      expect(pro.unwrap()).toBe(3);
    });

    it("and with err", async () => {
      const r = returnsOk();
      const pro = await r
        .andThenAsync(async (val) => ok(val + 1) as Result<number, Error>)
        .and(err("error"));

      expect(pro.isErr()).toBeTruthy();
      expect(() => pro.unwrap()).toThrow("error");
    });

    it("or", async () => {
      const r = returnsOk();
      const pro = await r
        .andThenAsync(async (val) => ok(val + 1) as Result<number, Error>)
        .or(ok(3));

      expect(pro.isOk()).toBeTruthy();
      expect(pro.unwrap()).toBe(OK_VALUE + 1);
    });

    it("chaining", async () => {
      const r = returnsOk();
      const pro = await r
        .andThenAsync(async (val) => ok(val + 1) as Result<number, Error>)
        .orElse(() => ok("other") as Result<string, Error>)
        .andThenAsync(
          async (val) => ok(val) as Result<string | number, string>
        );

      expect(pro.isOk()).toBeTruthy();
      expect(pro.unwrap()).toBe(OK_VALUE + 1);
    });
  });
});
