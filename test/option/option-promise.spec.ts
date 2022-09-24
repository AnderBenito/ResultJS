import { err, ok, Option, OptionPromise, Result, some } from "../../src";

describe("OptionPromise test", () => {
  const SOME_VALUE = 10;
  function returnsSome(): Option<number> {
    return some(SOME_VALUE);
  }

  it("andThenAsync should give a OptionPromise", async () => {
    const r = returnsSome();
    const pro = r.andThenAsync(async (val) => some(val + 1));

    expect(pro).toBeInstanceOf(OptionPromise);
    expect(await pro.unwrap()).toBe(SOME_VALUE + 1);
  });

  it("orElseAsync should give a OptionPromise", async () => {
    const r = returnsSome();
    const pro = r.orElseAsync(async () => some("a"));

    expect(pro).toBeInstanceOf(OptionPromise);
    expect(await pro.unwrap()).toBe(SOME_VALUE);
  });

  it("mapAsync should give a OptionPromise", async () => {
    const r = returnsSome();
    const pro = r.mapAsync(async (val) => val + 1);

    expect(pro).toBeInstanceOf(OptionPromise);
    expect(await pro.unwrap()).toBe(SOME_VALUE + 1);
  });
});
