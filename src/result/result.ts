import { CompositeError, isCompositeError } from "../CompositeError";
import {
  CombinedResult,
  MergeCombinedResult,
  MergeCompositeError,
  ResultData,
} from "./types";
import { isCombinedResult, isError } from "./utils";

export type ExtractResult<R> = R extends Resultable<infer T, any> ? T : never;
export type ExtractError<R> = R extends Resultable<any, infer E>
  ? E extends Error
    ? E
    : never
  : never;

export interface Resultable<T, E extends Error = Error> {
  isOk(): this is OkResult<T, E>;
  isErr(): this is ErrorResult<T, E>;
  unwrap(): T;
  unwrapOr(val: T): T;
  unwrapOrElse(f: (err: E) => T): T;
  map<U>(f: (val: T) => U): Result<U, E>;
  mapErr<Eo extends Error>(f: (err: E) => Eo): Result<T, Eo>;
  andTry<U, Eo extends Error>(
    result: Result<U, Eo>
  ): Result<MergeCombinedResult<T, U>, MergeCompositeError<E, Eo>>;
}

interface OkResult<T, E extends Error> extends Resultable<T, E> {
  getValue(): T;
}

interface ErrorResult<T, E extends Error> extends Resultable<T, E> {
  getErr(): E;
}

export type Result<T, E extends Error = Error> =
  | OkResult<T, E>
  | ErrorResult<T, E>;

abstract class _Result<T, E extends Error = Error> implements Resultable<T, E> {
  public readonly data: ResultData<T, E>;
  constructor(val: ResultData<T, E>) {
    this.data = val;
  }

  public isOk(): this is OkResult<T, never> {
    return !isError(this.data);
  }

  public isErr(): this is ErrorResult<never, E> {
    return isError(this.data);
  }

  public unwrap(): T {
    if (isError(this.data)) throw this.data.err;
    return this.data.val;
  }

  public unwrapOr(val: T): T {
    if (isError(this.data)) return val;
    return this.data.val;
  }

  public unwrapOrElse(f: (err: E) => T): T {
    if (isError(this.data)) return f(this.data.err);
    return this.data.val;
  }

  public map<U>(f: (val: T) => U): Result<U, E> {
    if (isError(this.data)) return error(this.data.err);
    return ok(f(this.data.val));
  }

  public mapErr<Eo extends Error>(f: (err: E) => Eo): Result<T, Eo> {
    if (isError(this.data)) return error(f(this.data.err));
    return ok(this.data.val);
  }

  // public transpose(): Optional<T> {
  //   if (isError(this.data)) return Optional.None();
  //   return Optional.Some(this.data.val);
  // }

  public andTry<U, Eo extends Error>(
    result: Result<U, Eo>
  ): Result<MergeCombinedResult<T, U>, MergeCompositeError<E, Eo>> {
    if (!isError(this.data)) {
      try {
        const otherResult = result.unwrap();

        if (isCombinedResult(this.data.val) && isCombinedResult(otherResult)) {
          return ok({
            __typename: "CombinedResult",
            result: [...this.data.val.values, ...otherResult.values],
          }) as any;
        }
        if (isCombinedResult(this.data.val))
          return ok({
            __typename: "CombinedResult",
            result: [...this.data.val.values, otherResult],
          }) as any;
        return ok({
          __typename: "CombinedResult",
          result: [this.data.val, otherResult],
        }) as any;
      } catch (otherError) {
        if (isCompositeError(otherError)) {
          return error(otherError) as any;
        }
        return error(new CompositeError(otherError)) as any;
      }
    }

    if (isError(this.data)) {
      const myError = this.data.err;
      try {
        result.unwrap();

        if (isCompositeError(myError)) {
          return error(myError) as any;
        }
        return error(new CompositeError(myError)) as any;
      } catch (otherError) {
        if (isCompositeError(myError) && isCompositeError(otherError)) {
          return error(myError.merge(otherError)) as any;
        }

        if (isCompositeError(myError)) {
          return error(myError.append(otherError)) as any;
        }

        if (isCompositeError(otherError)) {
          return error(otherError.prepend(myError)) as any;
        }

        return error(new CompositeError(myError, otherError)) as any;
      }
    }
  }
}

class _OkResult<T> extends _Result<T, never> implements OkResult<T, never> {
  constructor(private val: T) {
    super({ val });
  }
  getValue(): T {
    return this.val;
  }
}

class _ErrorResult<E extends Error>
  extends _Result<never, E>
  implements ErrorResult<never, E>
{
  constructor(private err: E) {
    super({ err });
  }
  getErr(): E {
    return this.err;
  }
}

export const ok = <T>(val: T): Result<T, never> => new _OkResult(val);
export const error = <E extends Error>(err: E): Result<never, E> =>
  new _ErrorResult<E>(err);
export const tryAll = <T extends Result<any, any>[]>(
  ...results: T
): Result<
  CombinedResult<{ [I in keyof T]: ExtractResult<T[I]> }>,
  CompositeError<{ [R in keyof T]: ExtractError<T[R]> }>
> => {
  const r: { [I in keyof T]: ExtractResult<T[I]> } = [] as any;
  let e = new CompositeError<any[]>();

  for (const result of results) {
    try {
      r.push(result.unwrap());
    } catch (error) {
      e = e.append(error);
    }
  }

  if (e.hasErrors()) return;
  error(e) as Result<
    never,
    CompositeError<{ [R in keyof T]: ExtractError<T[R]> }>
  >;
  return ok({ __typename: "CombinedResult", values: r });
};

function testic(): Result<number> {
  return ok(2);
}

function tryis() {
  const r = testic().andTry(testic());

  if (r.isOk()) {
    const { values } = r.getValue();
    return;
  }

  r.unwrap();
}
