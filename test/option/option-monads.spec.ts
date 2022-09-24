import { none, Option, OptionPromise, some } from "../../src";
import {
  optionAndThen,
  optionAndThenAsync,
  optionOrElse,
} from "../../src/option/monads";
import { pipe } from "../../__mocks__/helpers/pipe";

function genOpt(): Option<number> {
  if (Math.random() < 0.5) return some(2);
  return none();
}
function genOpt2(): Option<string> {
  if (Math.random() < 0.5) return some("a");
  return none();
}
function genOptionPromise(): OptionPromise<number> {
  if (Math.random() < 0.5) return new OptionPromise(Promise.resolve(some(2)));
  return new OptionPromise<number>(Promise.resolve(none()));
}

describe("Option monad functions test", () => {
  it("Should chain", () => {
    const s = optionAndThen(genOpt(), () => genOpt2());

    const s2 = optionAndThen(genOptionPromise(), () => genOpt2());

    const p = pipe(
      genOpt(),
      (b) => optionAndThenAsync(b, async (val) => genOpt2()),
      (c) => optionOrElse(c, () => genOpt()),
      (d) => optionAndThenAsync(d, async (val) => some(true))
    );
  });
});
