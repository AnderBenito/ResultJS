import { wrap, wrapAsync } from "../../src";

describe("Result wrap tests", () => {
  it("Should wrap function in Ok Result", () => {
    const cb = () => 2;

    const result = wrap(cb);

    expect(result.isOk()).toBeTruthy();
    expect(result.unwrap()).toBe(2);
  });

  it("Should wrap function in Err Result", () => {
    const cb = () => {
      throw new Error("1");
    };

    const result = wrap<number, Error>(cb);

    expect(result.isErr()).toBeTruthy();
    if (result.isErr()) {
      expect(result.getErr().message).toBe("1");
    }
  });

  it("Should wrap async function in Ok Result", async () => {
    const cb = async () => 2;

    const result = await wrapAsync(cb);

    expect(result.isOk()).toBeTruthy();
    expect(result.unwrap()).toBe(2);
  });

  it("Should wrap async function in Err Result", async () => {
    const cb = async () => {
      throw new Error("1");
    };

    const result = await wrapAsync<number, Error>(cb);

    expect(result.isErr()).toBeTruthy();
    if (result.isErr()) {
      expect(result.getErr().message).toBe("1");
    }
  });
});
