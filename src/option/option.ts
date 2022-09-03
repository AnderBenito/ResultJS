import { error, ok, Result } from "../result";

export interface Option<T> {
  isSome(): boolean;
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

class _Option<T> implements Option<T> {
  constructor(public readonly val?: T) {}

  public isSome(): boolean {
    return hasValue(this.val);
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

  unwrapOrElse(f: () => T): T {
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
    if (hasValue(this.val)) return f(this.val) === true ? this : none;
    return none;
  }

  public zip<U>(other: Option<U>): Option<[T, U]> {
    if (hasValue(this.val) && other.isSome())
      return some([this.val, other.unwrap()]);
    return none;
  }
}

export const some = <T>(val: T): Option<T> => new _Option(val);
export const none = new _Option<never>();
export const optionFrom = <T>(val?: T): Option<T> =>
  hasValue(val) ? some(val) : none;

const hasValue = <T>(val?: T): val is T => val !== undefined && val !== null;
