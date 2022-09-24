import { Err, err, Ok, ok, Result, ResultPromise } from "../result";

export class OptionUnwrapError extends Error {
  constructor() {
    super("Cannot unwrap value of a None variant");
  }
}

export type ExtractValue<T> = T extends Optionable<infer U> ? U : never;

export interface Optionable<T> {
  /**
   * Returns `true` if is an `Some` value
   */
  isSome(): this is Some<T>;
  /**
   * Returns `true` if is an `None` value
   */
  isNone(): this is None;
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
   * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and None to `Err(err)`.
   *
   * Arguments passed to `okOr` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `okOrElse`, which is lazily evaluated.
   */
  okOr<E>(err: E): Result<T, E>;
  /**
   * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and None to `Err(f())`.
   */
  okOrElse<E>(f: () => E): Result<T, E>;
  /**
   * Transforms `Option<T>` to `Option<U>` by applying the provided function `f` to the contained value of `Some` and leaving `None` values unchanged
   */
  map<U>(f: (val: T) => U): Option<U>;
  /**
   * Transforms `Option<T>` to `OptionPromise<U>` by applying the provided function `f` to the contained value of `Some` and leaving `None` values unchanged
   */
  mapAsync<U>(f: (val: T) => Promise<U>): OptionPromise<U>;
  /**
   * Calls the provided predicate function `f` on the contained value `t` if the `Option` is `Some(t)`, and returns `Some(t)` if the function returns true; otherwise, returns `None`
   */
  filter(f: (val: T) => boolean): Option<T>;
  /**
   * Returns `Some([x, y])` if this is `Some(x)` and the provided Option value is `Some(y)`; otherwise, returns `None`
   */
  zip<U>(other: Option<U>): Option<[T, U]>;
  /**
   * Removes one level of nesting from an `Option<Option<T>>`
   */
  flatten(): Option<T extends Option<infer U> ? U : T>;
  /**
   * Treat the `Option` as a boolean value, where `Some` acts like true and `None` acts like false.
   *
   * Takes another `Option` as input, and produce an `Option` as output. This produces an `Option<U>` value having a different inner type `U` than `Option<T>`.
   *
   * @returns `None` if this is `None`
   * @returns `None` if this is `Some<T>` and optb is `None`
   * @returns `Some<U>` if this is `Some<T>` and optb is `Some<U>`
   */
  and<U>(optb: Option<U>): Option<U>;
  /**
   * Treat the `Option` as a boolean value, where `Some` acts like true and `None` acts like false.
   *
   * Takes another `Option` as input, and produce an `Option` as output.
   *
   * @returns `Some<T>` if this is `Some<T>`
   * @returns `Some<U>` if this is `Some<T>` and optb is `Some<U>`
   * @returns `None` if this is `None` and optb is `None`
   */
  or<U>(optb: Option<U>): Option<T | U>;
  /**
   * Treat the `Option` as a boolean value, where `Some` acts like true and `None` acts like false.
   *
   * Takes another `Option` as input, and produce an `Option` as output.
   *
   * @returns `None` if this is `None` and optb is `None`
   * @returns `Some<U>` if this is `None` and optb is `Some<U>`
   * @returns `Some<T>` if this is `Some<T>` and optb is `None`
   * @returns `None` if this is `Some<T>` and optb is `Some<U>`
   */
  xor<U>(optb: Option<U>): Option<T | U>;
  /**
   * Returns `None` if the option is `None`, otherwise calls `f` with the wrapped value and returns the result.
   *
   * Some languages call this operation flatmap.
   */
  andThen<U>(f: (val: T) => Option<U>): Option<U>;
  /**
   * Returns `None` if the option is `None`, otherwise calls `f` with the wrapped value and returns the result.
   *
   * Some languages call this operation flatmap.
   */
  andThenAsync<U>(f: (val: T) => Promise<Option<U>>): OptionPromise<U>;
  /**
   * Returns the option if it contains a value, otherwise calls `f` and returns the result.
   */
  orElse<U>(f: () => Option<U>): Option<T | U>;
  /**
   * Returns the option if it contains a value, otherwise calls async `f` and returns the result.
   */
  orElseAsync<U>(f: () => Promise<Option<U>>): OptionPromise<T | U>;
}

// The Option<T> type is a superposition of SomeOption and a Optionable<never> (that has no value)
export type Optional<T> = T | undefined | null;
export type Option<T> = Some<T> | None;

export class Some<T> implements Optionable<T> {
  constructor(private value: T) {}

  isSome(): this is Some<T> {
    return true;
  }
  isNone(): false {
    return false;
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
  okOr(): Ok<T> {
    return ok(this.value);
  }
  okOrElse(): Ok<T> {
    return ok(this.value);
  }
  map<U>(f: (val: T) => U): Some<U> {
    return some(f(this.value));
  }
  mapAsync<U>(f: (val: T) => Promise<U>): OptionPromise<U> {
    return new OptionPromise(f(this.value).then((r) => some(r)));
  }
  filter(f: (val: T) => boolean): Option<T> {
    if (f(this.value) === true) return this;
    return none();
  }
  zip<U>(other: Option<U>): Option<[T, U]> {
    if (other.isSome()) return some<[T, U]>([this.value, other.getValue()]);
    return none();
  }
  flatten(): Option<T extends Option<infer U> ? U : T> {
    if (isOption<T extends Option<infer U> ? U : T>(this.value)) {
      if (this.value.isNone()) return none();
      return some(this.value.getValue());
    }
    return some(this.value) as Option<T extends Option<infer U> ? U : T>;
  }
  getValue(): T {
    return this.value;
  }
  and<U>(option: Option<U>): Option<U> {
    return option;
  }
  or(): Some<T> {
    return this;
  }
  xor<U>(option: Option<U>): Option<T> {
    if (option.isSome()) return none();
    return this;
  }
  andThen<U>(f: (val: T) => Option<U>): Option<U> {
    return f(this.value);
  }
  andThenAsync<U>(f: (val: T) => Promise<Option<U>>): OptionPromise<U> {
    return new OptionPromise(f(this.value));
  }
  orElse(): Some<T> {
    return this;
  }
  orElseAsync<U>(): OptionPromise<T | U> {
    return new OptionPromise(Promise.resolve(this));
  }
}

export class None implements Optionable<never> {
  isSome(): false {
    return false;
  }
  isNone(): this is None {
    return !this.isSome();
  }
  expect(msg: string): never {
    throw new Error(msg);
  }
  unwrap(): never {
    throw new OptionUnwrapError();
  }
  unwrapOr<T>(val: T): T {
    return val;
  }
  unwrapOrElse<T>(f: () => T): T {
    return f();
  }
  unwrapOrUndefined<T>(): T | undefined {
    return undefined;
  }
  okOr<E>(error: E): Err<E> {
    return err(error);
  }
  okOrElse<E>(f: () => E): Err<E> {
    return err(f());
  }
  map(): None {
    return none();
  }
  mapAsync<U>(): OptionPromise<U> {
    return new OptionPromise<never>(Promise.resolve(none()));
  }
  filter(): None {
    return none();
  }
  zip(): None {
    return none();
  }
  flatten(): None {
    return none();
  }
  and(): None {
    return this;
  }
  or<U>(option: Option<U>): Option<U> {
    return option;
  }
  xor<U>(option: Option<U>): Option<U> {
    if (option.isSome()) return option;
    return this;
  }
  andThen(): None {
    return this;
  }
  andThenAsync(): OptionPromise<never> {
    return new OptionPromise<never>(Promise.resolve(this));
  }
  orElse<U>(f: () => Option<U>): Option<U> {
    return f();
  }
  orElseAsync<U>(f: () => Promise<Option<U>>): OptionPromise<U> {
    return new OptionPromise(f());
  }
}

export class OptionPromise<T> implements Promise<Option<T>> {
  constructor(readonly promise: Promise<Option<T>>) {}
  then<TResult1 = Option<T>, TResult2 = never>(
    onfulfilled?: (value: Option<T>) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }
  catch<TResult = never>(
    onrejected?: (reason: any) => TResult | PromiseLike<TResult>
  ): Promise<Option<T> | TResult> {
    return this.promise.catch(onrejected);
  }
  finally(onfinally?: () => void): Promise<Option<T>> {
    return this.promise.finally(onfinally);
  }
  [Symbol.toStringTag]: string;

  /**
   * Extract the contained value in `Option<T>` when is `Some`
   *
   * If is `None` throws error with custom message `msg`
   */
  expect(msg: string): Promise<T> {
    return this.promise.then((p) => p.expect(msg));
  }
  /**
   * Extract the contained value in `Option<T>` when is `Some`
   *
   * If is `None` throws error with generic message
   */
  unwrap(): Promise<T> {
    return this.promise.then((p) => p.unwrap());
  }
  /**
   * Extract the contained value in `Option<T>` when is `Some`
   *
   * If is `None` returns the provided default value `val`
   */
  unwrapOr(val: T): Promise<T> {
    return this.promise.then((p) => p.unwrapOr(val));
  }
  /**
   * Extract the contained value in `Option<T>` when is `Some`
   *
   * If is `None` returns the result of evaluating the provided function `f`
   */
  unwrapOrElse(f: () => T): Promise<T> {
    return this.promise.then((p) => p.unwrapOrElse(f));
  }
  /**
   * Extract the contained value in `Option<T>` when is `Some`
   *
   * If is `None` returns undefined
   */
  unwrapOrUndefined(): Promise<T | undefined> {
    return this.promise.then((p) => p.unwrapOrUndefined());
  }
  /**
   * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and None to `Err(err)`.
   *
   * Arguments passed to `okOr` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `okOrElse`, which is lazily evaluated.
   */
  okOr<E>(err: E): ResultPromise<Result<T, E>> {
    return new ResultPromise(this.promise.then((p) => p.okOr(err)));
  }
  /**
   * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and None to `Err(f())`.
   */
  okOrElse<E>(f: () => E): ResultPromise<Result<T, E>> {
    return new ResultPromise(this.promise.then((p) => p.okOrElse(f)));
  }
  /**
   * Transforms `Option<T>` to `Option<U>` by applying the provided function `f` to the contained value of `Some` and leaving `None` values unchanged
   */
  map<U>(f: (val: T) => U): OptionPromise<U> {
    return new OptionPromise(this.promise.then((p) => p.map(f)));
  }
  /**
   * Transforms `OptionPromise<T>` to `Option<U>` by applying the provided function `f` to the contained value of `Some` and leaving `None` values unchanged
   */
  mapAsync<U>(f: (val: T) => Promise<U>): OptionPromise<U> {
    return new OptionPromise(this.promise.then((p) => p.mapAsync(f)));
  }
  /**
   * Calls the provided predicate function `f` on the contained value `t` if the `Option` is `Some(t)`, and returns `Some(t)` if the function returns true; otherwise, returns `None`
   */
  filter(f: (val: T) => boolean): OptionPromise<T> {
    return new OptionPromise(this.promise.then((p) => p.filter(f)));
  }
  /**
   * Returns `Some([x, y])` if this is `Some(x)` and the provided Option value is `Some(y)`; otherwise, returns `None`
   */
  zip<U>(other: Option<U>): OptionPromise<[T, U]> {
    return new OptionPromise(this.promise.then((p) => p.zip(other)));
  }
  /**
   * Removes one level of nesting from an `Option<Option<T>>`
   */
  flatten(): OptionPromise<T extends Option<infer U> ? U : T> {
    return new OptionPromise(this.promise.then((p) => p.flatten()));
  }
  /**
   * Treat the `Option` as a boolean value, where `Some` acts like true and `None` acts like false.
   *
   * Takes another `Option` as input, and produce an `Option` as output. This produces an `Option<U>` value having a different inner type `U` than `Option<T>`.
   *
   * @returns `None` if this is `None`
   * @returns `None` if this is `Some<T>` and optb is `None`
   * @returns `Some<U>` if this is `Some<T>` and optb is `Some<U>`
   */
  and<U>(optb: Option<U>): OptionPromise<U> {
    return new OptionPromise(this.promise.then((p) => p.and(optb)));
  }
  /**
   * Treat the `Option` as a boolean value, where `Some` acts like true and `None` acts like false.
   *
   * Takes another `Option` as input, and produce an `Option` as output.
   *
   * @returns `Some<T>` if this is `Some<T>`
   * @returns `Some<U>` if this is `Some<T>` and optb is `Some<U>`
   * @returns `None` if this is `None` and optb is `None`
   */
  or<U>(optb: Option<U>): OptionPromise<T | U> {
    return new OptionPromise<T | U>(this.promise.then((p) => p.or(optb)));
  }
  /**
   * Treat the `Option` as a boolean value, where `Some` acts like true and `None` acts like false.
   *
   * Takes another `Option` as input, and produce an `Option` as output.
   *
   * @returns `None` if this is `None` and optb is `None`
   * @returns `Some<U>` if this is `None` and optb is `Some<U>`
   * @returns `Some<T>` if this is `Some<T>` and optb is `None`
   * @returns `None` if this is `Some<T>` and optb is `Some<U>`
   */
  xor<U>(optb: Option<U>): OptionPromise<T | U> {
    return new OptionPromise<T | U>(this.promise.then((p) => p.xor(optb)));
  }
  /**
   * Returns `None` if the option is `None`, otherwise calls `f` with the wrapped value and returns the result.
   *
   * Some languages call this operation flatmap.
   */
  andThen<U>(f: (val: T) => Option<U>): OptionPromise<U> {
    return new OptionPromise(this.promise.then((p) => p.andThen(f)));
  }
  /**
   * Returns `None` if the option is `None`, otherwise calls `f` with the wrapped value and returns the result.
   *
   * Some languages call this operation flatmap.
   */
  andThenAsync<U>(f: (val: T) => Promise<Option<U>>): OptionPromise<U> {
    return new OptionPromise(this.promise.then((p) => p.andThenAsync(f)));
  }
  /**
   * Returns the option if it contains a value, otherwise calls `f` and returns the result.
   */
  orElse<U>(f: () => Option<U>): OptionPromise<T | U> {
    return new OptionPromise<T | U>(this.promise.then((p) => p.orElse(f)));
  }
  /**
   * Returns the option if it contains a value, otherwise calls `f` and returns the result.
   */
  orElseAsync<U>(f: () => Promise<Option<U>>): OptionPromise<T | U> {
    return new OptionPromise<T | U>(this.promise.then((p) => p.orElseAsync(f)));
  }
}

const _none: None = new None();
/**
 * Creates an `Option` of `Some(val)` value
 */
export const some = <T>(val: T): Some<T> => new Some(val);
/**
 * Creates an `Option` of `None` value
 */
export const none = () => _none;
/**
 * Creates an `Option` of `Some(val)` if `val` is defined. If `val` is undefined or null creates a `None` value.
 */
export const optionFrom = <T>(val?: T): Option<T> =>
  hasValue(val) ? some(val) : none();

const hasValue = <T>(val?: T): val is T => val !== undefined && val !== null;

/**
 * Transforms a `Option` of a `Result` into an `Result` of an `Option`
 *
 * `None` will be mapped to `Ok(None)`. `Some(Ok(_))` and `Some(Err(_))` will be mapped to `Ok(Some(_))` and `Err(_)`.
 */
export const transposeOption = <T, E>(
  option: Option<Result<T, E>>
): Result<Option<T>, E> => {
  if (option.isSome()) {
    const result = option.getValue();

    if (result.isOk()) return ok(some(result.getValue()));
    return err(result.getErr());
  }

  return ok(none());
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

  return none();
};

export const isOption = <T>(opt: unknown): opt is Option<T> => {
  return opt instanceof None || opt instanceof Some;
};
