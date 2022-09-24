import { Result, ResultPromise } from "./result";

/**
 * Transforms `Result<T, E>` to `Result<U, E>` by applying the provided function `f` to the contained value of `Ok(t)` and leaving `Err` values unchanged
 */
export function resultMap<T, E, U>(
  r: Result<T, E>,
  f: (val: T) => U
): Result<U, E>;
export function resultMap<T, E, U>(
  r: ResultPromise<Result<T, E>>,
  f: (val: T) => U
): ResultPromise<Result<U, E>>;
export function resultMap<T, E, U>(
  r: Result<T, E> | ResultPromise<Result<T, E>>,
  f: (val: T) => U
): Result<U, E> | ResultPromise<Result<U, E>> {
  return r.map(f);
}

/**
 * Transforms `Result<T, E>` to `ResultPromise<U, E>` by applying the provided async function `f` to the contained value of `Ok(t)` and leaving `Err` values unchanged
 */
export function resultMapAsync<T, E, U>(
  r: Result<T, E>,
  f: (val: T) => Promise<U>
): ResultPromise<Result<U, E>>;
export function resultMapAsync<T, E, U>(
  r: ResultPromise<Result<T, E>>,
  f: (val: T) => Promise<U>
): ResultPromise<Result<U, E>>;
export function resultMapAsync<T, E, U>(
  r: Result<T, E> | ResultPromise<Result<T, E>>,
  f: (val: T) => Promise<U>
): ResultPromise<Result<U, E>> {
  return r.mapAsync(f);
}

/**
 * Transforms `Result<T, E>` to `Result<T, F>` by applying the provided function `f` to the contained value of `Err(err)` and leaving `Ok` values unchanged
 */
export function resultMapErr<T, E, F>(
  r: Result<T, E>,
  f: (e: E) => F
): Result<T, F>;
export function resultMapErr<T, E, F>(
  r: ResultPromise<Result<T, E>>,
  f: (e: E) => F
): ResultPromise<Result<T, F>>;
export function resultMapErr<T, E, F>(
  r: Result<T, E> | ResultPromise<Result<T, E>>,
  f: (e: E) => F
): Result<T, F> | ResultPromise<Result<T, F>> {
  return r.mapErr(f);
}

/**
 * Calls `f` if the result is `Ok`, otherwise returns the `Err` value of self.
 *
 * This function can be used for control flow based on Result values.
 */
export function resultAndThen<T, E, U, F>(
  r: Result<T, E>,
  f: (val: T) => Result<U, F>
): Result<U, E | F>;
export function resultAndThen<T, E, U, F>(
  r: ResultPromise<Result<T, E>>,
  f: (val: T) => Result<U, F>
): ResultPromise<Result<U, E | F>>;
export function resultAndThen<T, E, U, F>(
  r: ResultPromise<Result<T, E>> | Result<T, E>,
  f: (val: T) => Result<U, F>
): ResultPromise<Result<U, E | F>> | Result<U, E | F> {
  return r.andThen(f);
}

/**
 * Calls async `f` if the result is `Ok`, otherwise returns the `Err` value of self.
 *
 * This function can be used for control flow based on Result values.
 */
export function resultAndThenAsync<T, E, U, F>(
  r: Result<T, E>,
  f: (val: T) => Promise<Result<U, F>>
): ResultPromise<Result<U, E | F>>;
export function resultAndThenAsync<T, E, U, F>(
  r: ResultPromise<Result<T, E>>,
  f: (val: T) => Promise<Result<U, F>>
): ResultPromise<Result<U, E | F>>;
export function resultAndThenAsync<T, E, U, F>(
  r: ResultPromise<Result<T, E>> | Result<T, E>,
  f: (val: T) => Promise<Result<U, F>>
): ResultPromise<Result<U, E | F>> {
  return r.andThenAsync(f);
}

/**
 * Calls `f` if the result is `Err`, otherwise returns the `Ok` value of self.
 *
 * This function can be used for control flow based on result values.
 */
export function resultOrElse<T, E, U, F>(
  r: Result<T, E>,
  f: (e: E) => Result<U, F>
): Result<T | U, F>;
export function resultOrElse<T, E, U, F>(
  r: ResultPromise<Result<T, E>>,
  f: (e: E) => Result<U, F>
): ResultPromise<Result<T | U, F>>;
export function resultOrElse<T, E, U, F>(
  r: ResultPromise<Result<T, E>> | Result<T, E>,
  f: (e: E) => Result<U, F>
): ResultPromise<Result<T | U, F>> | Result<T | U, F> {
  return r.orElse(f);
}

/**
 * Calls async `f` if the result is `Err`, otherwise returns the `Ok` value of self.
 *
 * This function can be used for control flow based on result values.
 */
export function resultOrElseAsync<T, E, U, F>(
  r: Result<T, E>,
  f: (e: E) => Promise<Result<U, F>>
): ResultPromise<Result<T | U, F>>;
export function resultOrElseAsync<T, E, U, F>(
  r: ResultPromise<Result<T, E>>,
  f: (e: E) => Promise<Result<U, F>>
): ResultPromise<Result<T | U, F>>;
export function resultOrElseAsync<T, E, U, F>(
  r: ResultPromise<Result<T, E>> | Result<T, E>,
  f: (e: E) => Promise<Result<U, F>>
): ResultPromise<Result<T | U, F>> {
  return r.orElseAsync(f);
}
