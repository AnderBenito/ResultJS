import {
  err,
  ok,
  Result,
  resultAndThen,
  resultAndThenAsync,
  resultMapAsync,
  resultOrElse,
  ResultPromise,
} from "../../src";

import { pipe } from "../../__mocks__/helpers/pipe";

function genResult(): Result<number, Error> {
  if (Math.random() < 0.5) return ok(2);
  return err(new Error(""));
}
function genResult2(): Result<string, string> {
  if (Math.random() < 0.5) return ok("a");
  return err("error");
}
function genResultPromise(): ResultPromise<Result<number, Error>> {
  if (Math.random() < 0.5) return new ResultPromise(Promise.resolve(ok(2)));
  return new ResultPromise(Promise.resolve(err(new Error(""))));
}

describe("Result monad functions test", () => {
  it("Should chain", () => {
    const s = resultAndThen(genResult(), () => genResult2());

    const s2 = resultAndThen(genResultPromise(), () => genResult2());

    const p = pipe(
      genResult(),
      (a) => resultAndThen(a, (val) => genResult2()),
      (b) => resultAndThenAsync(b, async (val) => genResult2()),
      (c) => resultOrElse(c, (e) => genResult2()),
      (d) => resultMapAsync(d, async (val) => true)
    );
  });
});
