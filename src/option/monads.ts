import { Option, OptionPromise } from "./option";

/**
 * Transforms `Option<T>` to `Option<U>` by applying the provided function `f` to the contained value of `Some` and leaving `None` values unchanged
 */
export function optionMap<T, U>(o: Option<T>, f: (val: T) => U): Option<U>;
export function optionMap<T, U>(
  o: OptionPromise<T>,
  f: (val: T) => U
): OptionPromise<U>;
export function optionMap<T, U>(
  o: Option<T> | OptionPromise<T>,
  f: (val: T) => U
): Option<U> | OptionPromise<U> {
  return o.map(f);
}

/**
 * Transforms `Option<T>` to `OptionPromise<U>` by applying the provided function `f` to the contained value of `Some` and leaving `None` values unchanged
 */
export function optionMapAsync<T, U>(
  o: Option<T>,
  f: (val: T) => Promise<U>
): OptionPromise<U>;
export function optionMapAsync<T, U>(
  o: OptionPromise<T>,
  f: (val: T) => Promise<U>
): OptionPromise<U>;
export function optionMapAsync<T, U>(
  o: Option<T> | OptionPromise<T>,
  f: (val: T) => Promise<U>
): OptionPromise<U> {
  return o.mapAsync(f);
}

/**
 * Returns `None` if the option is `None`, otherwise calls `f` with the wrapped value and returns the result.
 *
 * Some languages call this operation flatmap.
 */
export function optionAndThen<T, U>(
  o: Option<T>,
  f: (val: T) => Option<U>
): Option<U>;
export function optionAndThen<T, U>(
  o: OptionPromise<T>,
  f: (val: T) => Option<U>
): OptionPromise<U>;
export function optionAndThen<T, U>(
  o: Option<T> | OptionPromise<T>,
  f: (val: T) => Option<U>
): Option<U> | OptionPromise<U> {
  return o.andThen(f);
}

/**
 * Returns `None` if the option is `None`, otherwise calls `f` with the wrapped value and returns the result.
 *
 * Some languages call this operation flatmap.
 */
export function optionAndThenAsync<T, U>(
  o: Option<T>,
  f: (val: T) => Promise<Option<U>>
): OptionPromise<U>;
export function optionAndThenAsync<T, U>(
  o: OptionPromise<T>,
  f: (val: T) => Promise<Option<U>>
): OptionPromise<U>;
export function optionAndThenAsync<T, U>(
  o: Option<T> | OptionPromise<T>,
  f: (val: T) => Promise<Option<U>>
): OptionPromise<U> {
  return o.andThenAsync(f);
}

/**
 * Returns the option if it contains a value, otherwise calls `f` and returns the result.
 */
export function optionOrElse<T, U>(
  o: Option<T>,
  f: () => Option<U>
): Option<T | U>;
export function optionOrElse<T, U>(
  o: OptionPromise<T>,
  f: () => Option<U>
): OptionPromise<T | U>;
export function optionOrElse<T, U>(
  o: Option<T> | OptionPromise<T>,
  f: () => Option<U>
): Option<T | U> | OptionPromise<T | U> {
  return o.orElse(f);
}

/**
 * Returns the option if it contains a value, otherwise calls async `f` and returns the result.
 */
export function optionOrElseAsync<T, U>(
  o: Option<T>,
  f: () => Promise<Option<U>>
): OptionPromise<T | U>;
export function optionOrElseAsync<T, U>(
  o: OptionPromise<T>,
  f: () => Promise<Option<U>>
): OptionPromise<T | U>;
export function optionOrElseAsync<T, U>(
  o: Option<T> | OptionPromise<T>,
  f: () => Promise<Option<U>>
): OptionPromise<T | U> {
  return o.orElseAsync(f);
}
