import { CompositeError } from "../CompositeError";
import { none, Option, some } from "../option";

export type ExtractResult<R> = R extends Resultable<infer T, any> ? T : never;
export type ExtractError<R> = R extends Resultable<any, infer E>
  ? E extends Error
    ? E
    : never
  : never;

export interface Resultable<T, E extends Error = Error> {
  /**
   * Returns `true` if is an `Ok` value
   */
  isOk(): this is Ok<T, E>;
  /**
   * Returns `true` if is an `Err` value
   */
  isErr(): this is Err<T, E>;
  /**
   * Returns the contained value if it's an `Ok`type
   * If the result is an `Err` throws the contained error
   *
   * Explicit error handling is prefered with isErr() narrowing
   */
  unwrap(): T;
  /**
   * Returns the contained value if it's an `Ok`type
   * If the result is an `Err` returns the provided `val` value
   *
   * @param val the value to return in case of `Err`
   */
  unwrapOr(val: T): T;
  /**
   * Returns the contained value if it's an `Ok`type
   * If the result is an `Err` returns the function `f` return value
   *
   * @param f the function to evaluate in case of `Err`
   */
  unwrapOrElse(f: (err: E) => T): T;
  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
   * leaving an `Err` value untouched.
   *
   * This function can be used to compose the results of two functions.
   */
  map<U>(f: (val: T) => U): Result<U, E>;
  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value,
   * leaving an `Ok` value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
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

export type Result<T, E extends Error = Error> = Ok<T, E> | Err<T, E>;

export class Ok<T, E extends Error> implements Resultable<T, E> {
  constructor(private val: T) {}

  isOk(): this is Ok<T, E> {
    return true;
  }
  isErr(): this is Err<T, E> {
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

export class Err<T, E extends Error> implements Resultable<T, E> {
  constructor(private error: E) {}

  isOk(): this is Ok<T, E> {
    return false;
  }
  isErr(): this is Err<T, E> {
    return !this.isOk();
  }
  unwrap(): never {
    throw this.error;
  }
  unwrapOr(val: T): T {
    return val;
  }
  unwrapOrElse(f: (err: E) => T): T {
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
  new Err<never, E>(err);

/**
 * Evaluates a set of `Result`s
 * Evaluates all values wether they are `Error` or `Ok`
 * If errors are found, returns a `CombinedError` with all of them.
 * If all values are `Ok`, returns a `CombinedResult` with all `Ok` values
 */
export const tryAll = <T extends Result<any, any>[]>(
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
export const all = <T extends Result<any, any>[]>(
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
export const tryAny = <T extends Result<any, any>[]>(
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
