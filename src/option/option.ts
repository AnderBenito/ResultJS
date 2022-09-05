import { error, ok, Result } from "../result";

export type ExtractValue<T> = T extends Optionable<infer U> ? U : never;

export interface Optionable<T> {
  /**
   * Returns `true` if is an `Some` value
   */
  isSome(): this is Some<T>;
  /**
   * Returns `true` if is an `None` value
   */
  isNone(): this is None<T>;
  /**
   * Extract the contained value in `Option<T>` when is `Some`
   *
   * If is `None` throws error with custom message `msg`
   */
  expect(msg: string): T;
  /**
   * Extract the contained value in `Option<T>` when is `Some`
   *
   * If is `None` throws error with generic message
   */
  unwrap(): T;
  /**
   * Extract the contained value in `Option<T>` when is `Some`
   *
   * If is `None` returns the provided default value `val`
   */
  unwrapOr(val: T): T;
  /**
   * Extract the contained value in `Option<T>` when is `Some`
   *
   * If is `None` returns the result of evaluating the provided function `f`
   */
  unwrapOrElse(f: () => T): T;
  /**
   * Extract the contained value in `Option<T>` when is `Some`
   *
   * If is `None` returns undefined
   */
  unwrapOrUndefined(): T | undefined;
  /**
   * Transforms `Option<T>` to `Result<T, E>`
   *
   * Transforms `Some(v)` to `Ok(v)`, and `None` to `Err(err)` using the provided default err value
   */
  okOr<E extends Error>(err: E): Result<T, E>;
  /**
   * Transforms `Option<T>` to `Option<U>` by applying the provided function `f` to the contained value of `Some` and leaving `None` values unchanged
   */
  map<U>(f: (val: T) => U): Option<U>;
  /**
   * Calls the provided predicate function `f` on the contained value `t` if the `Option` is `Some(t)`, and returns `Some(t)` if the function returns true; otherwise, returns `None`
   */
  filter(f: (val: T) => boolean): Option<T>;
  /**
   * Returns `Some([s, o])` if this is `Some(s)` and the provided Option value is `Some(o)`; otherwise, returns `None`
   */
  zip<U>(other: Option<U>): Option<[T, U]>;
  /**
   * Removes one level of nesting from an `Option<Option<T>>`
   */
  flatten(): Option<T extends Option<infer U> ? U : T>;
}

// The Option<T> type is a superposition of SomeOption and a Optionable<never> (that has no value)
export type Optional<T> = T | undefined | null;
export type Option<T> = Some<T> | None<T>;

export class Some<T> implements Optionable<T> {
  constructor(private value: T) {}

  isSome(): this is Some<T> {
    return true;
  }
  isNone(): this is None<T> {
    return !this.isSome();
  }
  expect(): T {
    return this.value;
  }
  unwrap(): T {
    return this.value;
  }
  unwrapOr(): T {
    return this.value;
  }
  unwrapOrElse(): T {
    return this.value;
  }
  unwrapOrUndefined(): T {
    return this.value;
  }
  okOr<E extends Error>(): Result<T, E> {
    return ok(this.value);
  }
  map<U>(f: (val: T) => U): Option<U> {
    return some(f(this.value));
  }
  filter(f: (val: T) => boolean): Option<T> {
    if (f(this.value) === true) return this;
    return none;
  }
  zip<U>(other: Option<U>): Option<[T, U]> {
    if (other.isSome()) return some([this.value, other.getValue()]);
    return none;
  }
  flatten(): Option<T extends Option<infer U> ? U : T> {
    if (isOption<T extends Option<infer U> ? U : T>(this.value)) {
      if (this.value.isNone()) return none;
      return some(this.value.getValue());
    }
    return some(this.value) as Option<T extends Option<infer U> ? U : T>;
  }
  getValue(): T {
    return this.value;
  }
}

export class None<T> implements Optionable<T> {
  isSome(): this is Some<never> {
    return false;
  }
  isNone(): this is None<T> {
    return !this.isSome();
  }
  expect(msg: string): never {
    throw new Error(msg);
  }
  unwrap(): never {
    throw new Error("Cannot get value of None");
  }
  unwrapOr(val: T): T {
    return val;
  }
  unwrapOrElse(f: () => T): T {
    return f();
  }
  unwrapOrUndefined(): undefined {
    return undefined;
  }
  okOr<E extends Error>(err: E): Result<T, E> {
    return error(err);
  }
  map(): Option<never> {
    return none;
  }
  filter(): Option<never> {
    return none;
  }
  zip(): Option<never> {
    return none;
  }
  flatten(): Option<T extends Option<infer U> ? U : T> {
    return none;
  }
}

export const some = <T>(val: T): Option<T> => new Some(val);
export const none: Option<never> = new None<never>();
export const optionFrom = <T>(val?: T): Option<T> =>
  hasValue(val) ? some(val) : none;

const hasValue = <T>(val?: T): val is T => val !== undefined && val !== null;

export const transposeOption = <T, E extends Error>(
  option: Option<Result<T, E>>
): Result<Option<T>, E> => {
  if (option.isSome()) {
    const result = option.getValue();

    if (result.isOk()) return ok(some(result.getValue()));
    return error(result.getErr());
  }

  return ok(none);
};

/**
 * Evaluates a set of `Option`s.
 * Returns a `Some` with all `Some` values if there is no `None`.
 *
 * Returns `None` with the first evaluated `None` result.
 */
export const allOptions = <T extends Option<any>[]>(
  ...options: T
): Option<{ [key in keyof T]: ExtractValue<T[key]> }> => {
  const okResults = [] as { [key in keyof T]: ExtractValue<T[key]> };

  for (const option of options) {
    if (option.isSome()) {
      okResults.push(option.getValue());
    } else {
      return option;
    }
  }

  return some(okResults);
};

/**
 * Evaluates a set of `Option`s.
 * Returns a `Some` with the first evaluated `Some`value.
 *
 * Returns `None` if no `Some` values are found.
 */
export const anyOptions = <T extends Option<any>[]>(
  ...options: T
): Option<{ [key in keyof T]: ExtractValue<T[key]> }[number]> => {
  for (const option of options) {
    if (option.isSome()) {
      return option;
    }
  }

  return none;
};

export const isOption = <T>(opt: unknown): opt is Option<T> => {
  return opt instanceof None || opt instanceof Some;
};
