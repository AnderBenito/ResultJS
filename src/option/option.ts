import { error, ok, Result } from "../result";

export interface Optionable<T> {
  isSome(): this is SomeOption<T>;
  isNone(): this is NoneOption<T>;
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

export interface SomeOption<T> extends Optionable<T> {
  getValue(): T;
}

export type NoneOption<T> = Optionable<T> & { __typename: "None" };

// The Option<T> type is a superposition of SomeOption and a Optionable<never> (that has no value)
export type Option<T> = SomeOption<T> | NoneOption<T>;

class _Option<T> implements Optionable<T> {
  constructor(public readonly val?: T) {}

  public isSome(): this is SomeOption<T> {
    return hasValue(this.val);
  }

  public isNone(): this is NoneOption<never> {
    return !this.isSome();
  }

  public expect(msg: string): T {
    if (!hasValue(this.val)) throw Error(msg);
    return this.val;
  }

  public unwrap(): T {
    if (!hasValue(this.val)) throw Error(`Optional has no value`);
    return this.val;
  }

  public unwrapOr(val: T): T {
    if (!hasValue(this.val)) return val;
    return this.val;
  }

  public unwrapOrElse(f: () => T): T {
    if (!hasValue(this.val)) return f();
    return this.val;
  }

  public unwrapOrUndefined(): T | undefined {
    return this.val;
  }

  public okOr<E extends Error>(err: E): Result<T, E> {
    if (hasValue(this.val)) return ok(this.val);
    return error(err);
  }

  public map<U>(f: (val: T) => U): Option<U> {
    if (hasValue(this.val)) return some(f(this.val));
    return none;
  }

  public filter(f: (val: T) => boolean): Option<T> {
    if (this.isSome()) return f(this.val) === true ? this : none;
    return none;
  }

  public zip<U>(other: Option<U>): Option<[T, U]> {
    if (hasValue(this.val) && other.isSome())
      return some([this.val, other.unwrap()]);
    return none;
  }
}

class _SomeOption<T> extends _Option<T> implements SomeOption<T> {
  constructor(private value: T) {
    super(value);
  }
  getValue(): T {
    return this.value;
  }
}

class _NoneOption<T> extends _Option<T> implements NoneOption<T> {
  __typename: "None";
}

export const some = <T>(val: T): Option<T> => new _SomeOption(val);
export const none: Option<never> = new _NoneOption<never>();
export const optionFrom = <T>(val?: T): Option<T> =>
  hasValue(val) ? some(val) : none;

const hasValue = <T>(val?: T): val is T => val !== undefined && val !== null;
