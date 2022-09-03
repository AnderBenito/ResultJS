export class CompositeError<T extends Error[]> extends Error {
  protected _errorStack: T;
  constructor(...errors: T) {
    super();
    this._errorStack = errors;
  }

  get message() {
    return this._errorStack.map((e) => e.message).join("\n");
  }

  get errors(): T {
    return this._errorStack;
  }

  public prepend<Y extends Error[]>(
    ...errors: Y
  ): CompositeError<[...Y, ...T]> {
    return new CompositeError(...errors, ...this.errors);
  }

  public append<Y extends Error[]>(...errors: Y): CompositeError<[...T, ...Y]> {
    return new CompositeError(...this.errors, ...errors);
  }

  public merge<Y extends Error[]>(
    composite: CompositeError<Y>
  ): CompositeError<[...T, ...Y]> {
    return new CompositeError(...this.errors, ...composite.errors);
  }

  public hasErrors() {
    return this._errorStack.length > 0;
  }
}

export const isCompositeError = <T extends Error[] = Error[]>(
  d: Error
): d is CompositeError<T> => d instanceof CompositeError;
