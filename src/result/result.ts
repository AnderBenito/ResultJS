import { CompositeError, isCompositeError } from "../CompositeError";
import { MergeCombinedResult, MergeCompositeError, ResultData } from "./types";
import { isCombinedResult, isError } from "./utils";

export type ExtractResult<R> = R extends Result<infer T, any> ? T : never;
export type ExtractError<R> = R extends Result<any, infer E>
  ? E extends Error
    ? E
    : never
  : never;

export interface Result<T, E extends Error = Error> {
  isOk(): boolean;
  isErr(): boolean;
  unwrap(): T;
  unwrapOr(val: T): T;
  unwrapOrElse(f: (err: E) => T): T;
  map<U>(f: (val: T) => U): Result<U, E>;
  mapErr<Eo extends Error>(f: (err: E) => Eo): Result<T, Eo>;
  andTry<U, Eo extends Error>(
    result: Result<U, Eo>
  ): Result<MergeCombinedResult<T, U>, MergeCompositeError<E, Eo>>;
}

export class _Result<T, E extends Error = Error> implements Result<T, E> {
  constructor(public readonly data: ResultData<T, E>) {}

  public isOk(): boolean {
    return !isError(this.data);
  }

  public isErr(): boolean {
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
            result: [...this.data.val.result, ...otherResult.result],
          }) as any;
        }
        if (isCombinedResult(this.data.val))
          return ok({
            __typename: "CombinedResult",
            result: [...this.data.val.result, otherResult],
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

export const ok = <T>(val: T): Result<T, never> => new _Result({ val });
export const error = <E extends Error>(err: E): Result<never, E> =>
  new _Result({ err });
export const tryAll = <T extends Result<any, any>[]>(
  ...results: T
): Result<
  { [I in keyof T]: ExtractResult<T[I]> },
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
  return ok(r);
};
