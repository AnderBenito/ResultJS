import { CompositeError, isCompositeError } from "../CompositeError";
import {
  CombinedResult,
  MergeCombinedResult,
  MergeCompositeError,
} from "./types";
import { isCombinedResult } from "./utils";

export type ExtractResult<R> = R extends Resultable<infer T, any> ? T : never;
export type ExtractError<R> = R extends Resultable<any, infer E>
  ? E extends Error
    ? E
    : never
  : never;

export interface Resultable<T, E extends Error = Error> {
  isOk(): this is Ok<T, E>;
  isErr(): this is Errored<T, E>;
  unwrap(): T;
  unwrapOr(val: T): T;
  unwrapOrElse(f: (err: E) => T): T;
  map<U>(f: (val: T) => U): Result<U, E>;
  mapErr<Eo extends Error>(f: (err: E) => Eo): Result<T, Eo>;
  andTry<U, Eo extends Error>(
    result: Result<U, Eo>
  ): Result<MergeCombinedResult<T, U>, MergeCompositeError<E, Eo>>;
}

export type Result<T, E extends Error = Error> = Ok<T, E> | Errored<T, E>;

export class Ok<T, E extends Error> implements Resultable<T, E> {
  constructor(private val: T) {}
  isOk(): this is Ok<T, E> {
    return true;
  }
  isErr(): this is Errored<T, E> {
    return !this.isOk();
  }
  unwrap(): T {
    return this.val;
  }
  unwrapOr(): T {
    return this.val;
  }
  unwrapOrElse(): T {
    return this.val;
  }
  map<U>(f: (val: T) => U): Result<U, E> {
    return ok(f(this.val));
  }
  mapErr<Eo extends Error>(): Result<T, Eo> {
    return ok(this.val);
  }
  andTry<U, Eo extends Error>(
    result: Result<U, Eo>
  ): Result<MergeCombinedResult<T, U>, MergeCompositeError<E, Eo>> {
    if (result.isOk()) {
      const otherResult = result.getValue();
      if (isCombinedResult(this.val) && isCombinedResult(otherResult)) {
        return ok({
          __typename: "CombinedResult",
          result: [...this.val.values, ...otherResult.values],
        }) as any;
      }
      if (isCombinedResult(this.val))
        return ok({
          __typename: "CombinedResult",
          result: [...this.val.values, otherResult],
        }) as any;
      return ok({
        __typename: "CombinedResult",
        result: [this.val, otherResult],
      }) as any;
    }

    const otherError = result.getErr();
    if (isCompositeError(otherError)) {
      return error(otherError) as any;
    }

    return error(new CompositeError(otherError)) as any;
  }
  getValue(): T {
    return this.val;
  }
}

export class Errored<T, E extends Error> implements Resultable<T, E> {
  constructor(private err: E) {}
  isOk(): this is Ok<T, E> {
    return false;
  }
  isErr(): this is Errored<T, E> {
    return !this.isOk();
  }
  unwrap(): never {
    throw this.err;
  }
  unwrapOr(val: T): T {
    return val;
  }
  unwrapOrElse(f: (err: E) => T): T {
    return f(this.err);
  }
  map<U>(): Result<U, E> {
    return error(this.err);
  }
  mapErr<Eo extends Error>(f: (err: E) => Eo): Result<T, Eo> {
    return error(f(this.err));
  }
  andTry<U, Eo extends Error>(
    result: Result<U, Eo>
  ): Result<MergeCombinedResult<T, U>, MergeCompositeError<E, Eo>> {
    if (result.isErr()) {
      const otherError = result.getErr();

      if (isCompositeError(this.err) && isCompositeError(otherError)) {
        return error(this.err.merge(otherError)) as any;
      }

      if (isCompositeError(this.err)) {
        return error(this.err.append(otherError)) as any;
      }

      if (isCompositeError(otherError)) {
        return error(otherError.prepend(this.err)) as any;
      }

      return error(new CompositeError(this.err, otherError)) as any;
    }

    if (isCompositeError(this.err)) {
      return error(this.err) as any;
    }

    return error(new CompositeError(this.err)) as any;
  }
  getErr(): E {
    return this.err;
  }
}

export const ok = <T>(val: T): Result<T, never> => new Ok(val);
export const error = <E extends Error>(err: E): Result<never, E> =>
  new Errored<never, E>(err);
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
