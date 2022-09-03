import { error, ok, Result } from "../result";

export interface Optionable<T> {
  isSome(): this is Some<T>;
  isNone(): this is None<T>;
  expect(msg: string): T;
  unwrap(): T;
  unwrapOr(val: T): T;
  unwrapOrElse(f: () => T): T;
  unwrapOrUndefined(): T | undefined;
  okOr<E extends Error>(err: E): Result<T, E>;
  map<U>(f: (val: T) => U): Option<U>;
  filter(f: (val: T) => boolean): Option<T>;
  zip<U>(other: Option<U>): Option<[T, U]>;
}

// The Option<T> type is a superposition of SomeOption and a Optionable<never> (that has no value)
export type Option<T> = Some<T> | None<T>;

class Some<T> implements Optionable<T> {
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
    if (f(this.value)) return this;
  }
  zip<U>(other: Option<U>): Option<[T, U]> {
    if (other.isSome()) return some([this.value, other.getValue()]);
  }
  getValue(): T {
    return this.value;
  }
}

class None<T> implements Optionable<T> {
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
  map<U>(): Option<U> {
    return none;
  }
  filter(): Option<T> {
    return none;
  }
  zip<U>(): Option<[T, U]> {
    return none;
  }
}

export const some = <T>(val: T): Option<T> => new Some(val);
export const none: Option<never> = new None<never>();
export const optionFrom = <T>(val?: T): Option<T> =>
  hasValue(val) ? some(val) : none;

const hasValue = <T>(val?: T): val is T => val !== undefined && val !== null;
