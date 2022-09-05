import { CompositeError } from "../CompositeError";
import { none, Option, some } from "../option";

export type ExtractResult<R> = R extends Ok<infer T> ? T : never;
export type ExtractError<R> = R extends Err<infer E>
  ? E extends Error
    ? E
    : never
  : never;

export interface Resultable<T, E extends Error = Error> {
  /**
   * Returns `true` if is an `Ok` value
   */
  isOk(): this is Ok<T>;
  /**
   * Returns `true` if is an `Err` value
   */
  isErr(): this is Err<E>;
  /**
   * Extract the contained value in `Result<T, E>` when is `Ok(t)`
   *
   * If is `Err(err)` throws err
   */
  unwrap(): T;
  /**
   * Extract the contained value in `Result<T, E>` when is `Ok(t)`
   *
   * If is `Err(err)` returns the provided default value `val`
   */
  unwrapOr(val: T): T;
  /**
   * Extract the contained value in `Result<T, E>` when is `Some`
   *
   * If is `Err(err)` returns the result of evaluating the provided function `f`
   */
  unwrapOrElse(f: (err: E) => T): T;
  /**
   * Transforms `Result<T, E>` to `Result<U, E>` by applying the provided function `f` to the contained value of `Ok(t)` and leaving `Err` values unchanged
   */
  map<U>(f: (val: T) => U): Result<U, E>;
  /**
   * Transforms `Result<T, E>` to `Result<T, F>` by applying the provided function `f` to the contained value of `Err(err)` and leaving `Ok` values unchanged
   */
  mapErr<F extends Error>(f: (err: E) => F): Result<T, F>;
  /**
   * Transforms `Result<T,E>` into `Option<E>`, mapping `Err(e)` to `Some(e)` and `Ok(v)` to None
   */
  err(): Option<E>;
  /**
   * Transforms `Result<T,E>` into `Option<T>`, mapping `Ok(v)` to `Some(v)` and `Err(e)` to None
   */
  ok(): Option<T>;
}

export type Result<T, E extends Error = Error> = Ok<T> | Err<E>;

export class Ok<T> implements Resultable<T, never> {
  constructor(private val: T) {}

  isOk(): this is Ok<T> {
    return true;
  }
  isErr(): false {
    return false;
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
  map<U, E extends Error>(f: (val: T) => U): Result<U, E> {
    return ok(f(this.val));
  }
  mapErr<F extends Error>(): Result<T, F> {
    return ok(this.val);
  }
  getValue(): T {
    return this.val;
  }
  ok(): Option<T> {
    return some(this.val);
  }
  err(): Option<never> {
    return none;
  }
}

export class Err<E extends Error> implements Resultable<never, E> {
  constructor(private error: E) {}

  isOk(): false {
    return false;
  }
  isErr(): this is Err<E> {
    return !this.isOk();
  }
  unwrap(): never {
    throw this.error;
  }
  unwrapOr<T>(val: T): T {
    return val;
  }
  unwrapOrElse<T>(f: (err: E) => T): T {
    return f(this.error);
  }
  map(): Result<never, E> {
    return error(this.error);
  }
  mapErr<F extends Error>(f: (err: E) => F): Result<never, F> {
    return error(f(this.error));
  }
  getErr(): E {
    return this.error;
  }
  ok(): Option<never> {
    return none;
  }
  err(): Option<E> {
    return some(this.error);
  }
}

export const ok = <T>(val: T): Result<T, never> => new Ok(val);
export const error = <E extends Error>(err: E): Result<never, E> =>
  new Err<E>(err);

/**
 * Evaluates a set of `Result`s
 * Evaluates all values wether they are `Error` or `Ok`
 * If errors are found, returns a `CombinedError` with all of them.
 * If all values are `Ok`, returns a `CombinedResult` with all `Ok` values
 */
export const tryAllResults = <T extends Result<any, any>[]>(
  ...results: T
): Result<
  { [I in keyof T]: ExtractResult<T[I]> },
  CompositeError<{ [R in keyof T]: ExtractError<T[R]> }>
> => {
  const okResults: { [I in keyof T]: ExtractResult<T[I]> } = [] as any;
  let errors = new CompositeError<any[]>();

  for (const result of results) {
    if (result.isOk()) {
      okResults.push(result.getValue());
    } else {
      errors = errors.append(result.getErr());
    }
  }

  if (errors.hasErrors())
    return error(errors) as Result<
      never,
      CompositeError<{ [R in keyof T]: ExtractError<T[R]> }>
    >;

  return ok(okResults);
};

/**
 * Evaluates a set of `Result`s.
 * Returns an `Ok` with all `Ok` values if there is no `Error`.
 *
 * Returns `Error` with the first evaluated error result.
 */
export const allResults = <T extends Result<any, any>[]>(
  ...results: T
): Result<
  { [I in keyof T]: ExtractResult<T[I]> },
  { [R in keyof T]: ExtractError<T[R]> }[number]
> => {
  const okResults: { [I in keyof T]: ExtractResult<T[I]> } = [] as any;

  for (const result of results) {
    if (result.isOk()) {
      okResults.push(result.getValue());
    } else {
      return result;
    }
  }

  return ok(okResults);
};

/**
 * Evaluates a set of `Result`s
 * Returns an `Ok` with the first result evaluated is `Ok`
 * If no `Ok` is found, returns an `Error` containing the collected error values
 */
export const anyResults = <T extends Result<any, any>[]>(
  ...results: T
): Result<
  { [I in keyof T]: ExtractResult<T[I]> }[number],
  CompositeError<{ [R in keyof T]: ExtractError<T[R]> }>
> => {
  let errors = new CompositeError<any[]>();

  for (const result of results) {
    if (result.isOk()) {
      return result;
    } else {
      errors = errors.append(result.getErr());
    }
  }

  return error(errors) as Result<
    never,
    CompositeError<{ [R in keyof T]: ExtractError<T[R]> }>
  >;
};

export const transposeResult = <T, E extends Error>(
  result: Result<Option<T>, E>
): Option<Result<T, E>> => {
  if (result.isOk()) {
    const val = result.getValue();

    if (val.isNone()) return none;
    return some(ok(val.getValue()));
  }

  return some(error(result.getErr()));
};
