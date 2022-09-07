import { None, none, Option, Some, some } from "../option";

export type ResultOkType<T> = T extends Ok<infer U> ? U : never;
export type ResultOkTypes<T> = {
  [key in keyof T]: T[key] extends Result<any, any>
    ? ResultOkType<T[key]>
    : never;
};
export type ResultErrType<E> = E extends Err<infer U> ? U : never;
export type ResultErrTypes<E extends Result<any, any>[]> = {
  [key in keyof E]: E[key] extends Result<any, any>
    ? ResultErrType<E[key]>
    : never;
};

export interface Resultable<T, E> {
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
   * Extract the contained value in `Result<T, E>` when is `Ok(t)`
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
  mapErr<F>(f: (err: E) => F): Result<T, F>;
  /**
   * Transforms `Result<T,E>` into `Option<E>`, mapping `Err(e)` to `Some(e)` and `Ok(v)` to None
   */
  err(): Option<E>;
  /**
   * Transforms `Result<T,E>` into `Option<T>`, mapping `Ok(v)` to `Some(v)` and `Err(e)` to None
   */
  ok(): Option<T>;
  /**
   * Treat the `Result` as a boolean value, where `Ok` acts like true and `Err` acts like false.
   *
   * The `and` method can produce a `Result<U, E>` value having a different inner type U than `Result<T, E>`.
   *
   * @returns `Err<E>` if this is `Err<E>`
   * @returns `Err<F>` if this is `Ok<T>` and res is `Err<F>`
   * @returns `Ok<U>` if this is `Ok<T>` and res is `Ok<U>`
   */
  and<U, F>(res: Result<U, F>): Result<U, E | F>;
  /**
   * Treat the `Result` as a boolean value, where Ok acts like true and Err acts like false.
   *
   * The `or` method can produce a `Result<T, F>` value having a different error type `F` `than Result<T, E>`.
   *
   * @returns `Ok<T>` if this is `Ok<Ts>`
   * @returns `Ok<U>` if this is `Err<E>` and res is `Ok<U>`
   * @returns `Err<F>` if this is `Err<E>` and res is `Err<F>`
   */
  or<U, F>(res: Result<U, F>): Result<T | U, F>;
  /**
   * Calls `f` if the result is `Ok`, otherwise returns the `Err` value of self.
   *
   * This function can be used for control flow based on Result values.
   */
  andThen<U>(f: (val: T) => Result<U, E>): Result<U, E>;
  /**
   * Calls `f` if the result is `Err`, otherwise returns the `Ok` value of self.
   *
   * This function can be used for control flow based on result values.
   */
  orElse<F>(f: (error: E) => Result<T, F>): Result<T, F>;
}

export type Result<T, E> = Ok<T> | Err<E>;

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
  map<U>(f: (val: T) => U): Ok<U> {
    return ok(f(this.val));
  }
  mapErr(): Ok<T> {
    return ok(this.val);
  }
  getValue(): T {
    return this.val;
  }
  ok(): Some<T> {
    return some(this.val);
  }
  err(): None {
    return none();
  }
  and<U, F>(res: Result<U, F>): Result<U, F> {
    return res;
  }
  or(): Ok<T> {
    return this;
  }
  andThen<U, E>(f: (val: T) => Result<U, E>): Result<U, E> {
    return f(this.val);
  }
  orElse(): Ok<T> {
    return this;
  }
}

export class Err<E> implements Resultable<never, E> {
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
  map(): Err<E> {
    return err(this.error);
  }
  mapErr<F>(f: (err: E) => F): Err<F> {
    return err(f(this.error));
  }
  getErr(): E {
    return this.error;
  }
  ok(): None {
    return none();
  }
  err(): Some<E> {
    return some(this.error);
  }
  and(): Err<E> {
    return this;
  }
  or<U, F>(res: Result<U, F>): Result<U, F> {
    return res;
  }
  andThen(): Err<E> {
    return this;
  }
  orElse<T, F>(f: (error: E) => Result<T, F>): Result<T, F> {
    return f(this.error);
  }
}

export const ok = <T>(val: T): Ok<T> => new Ok(val);
export const err = <E>(err: E): Err<E> => new Err<E>(err);

/**
 * Evaluates a set of `Result`s wether they are `Err` or `Ok`.
 *
 * Returns an array of `Option`s with all encountered `Err`.
 *
 * If all values are `Ok`, returns a tuple combining all values.
 */
export const tryAllResults = <T extends Result<any, any>[]>(
  ...results: T
): Result<
  ResultOkTypes<T>,
  { [key in keyof T]: Option<ResultErrType<T[key]>> }
> => {
  const okResults = [] as ResultOkTypes<T>;
  const errors = [] as { [key in keyof T]: Option<ResultErrType<T[key]>> };
  let errCount = 0;

  for (const result of results) {
    if (result.isOk()) {
      okResults.push(result.getValue());
      errors.push(none());
    } else {
      errCount++;
      errors.push(result.err());
    }
  }

  if (errCount > 0) return err(errors);

  return ok(okResults);
};

/**
 * Evaluates a set of `Result`s.
 *
 * Returns an `Ok` with all `Ok` values if there is no `Error`.
 *
 * Returns `Error` with the first evaluated error result.
 */
export const allResults = <T extends Result<any, any>[]>(
  ...results: T
): Result<ResultOkTypes<T>, ResultErrTypes<T>[number]> => {
  const okResults = [] as ResultOkTypes<T>;

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
 *
 * Returns an `Ok` with the first result evaluated is `Ok`
 *
 * If no `Ok` is found, returns an `Error` containing the collected error values
 */
export const anyResults = <T extends Result<any, any>[]>(
  ...results: T
): Result<ResultOkTypes<T>[number], ResultErrTypes<T>> => {
  const errors = [] as ResultErrTypes<T>;

  for (const result of results) {
    if (result.isOk()) {
      return result;
    } else {
      errors.push(result.getErr());
    }
  }

  return err(errors);
};

/**
 * Transforms a `Result` of an `Option` into an `Option` of a `Result`
 *
 * `Ok(None)` will be mapped to `None`. `Ok(Some(_))` and `Err(_)` will be mapped to `Some(Ok(_))` and `Some(Err(_))`
 */
export const transposeResult = <T, E>(
  result: Result<Option<T>, E>
): Option<Result<T, E>> => {
  if (result.isOk()) {
    const val = result.getValue();

    if (val.isNone()) return none();
    return some(ok(val.getValue()));
  }

  return some(err(result.getErr()));
};

export const isResult = <T, E>(res: unknown): res is Result<T, E> => {
  return res instanceof Ok || res instanceof Err;
};
