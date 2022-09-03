import { CompositeError, error, ok } from '../../src';


class BaseError extends Error {}

describe('Result test', () => {
  describe('Merging and combining', () => {
    it('Should merge in OK', () => {
      const r1 = ok(1);
      const r2 = ok(true);

      const r = r1.andTry(r2);

      expect(r.isErr()).toBeFalsy();
    });

    it('Should merge in Error', () => {
      const r1 = ok(1);
      const r2 = error(new BaseError('EXAMPLE ERROR'));

      const r = r1.andTry(r2);

      expect(r.isErr()).toBeTruthy();
      expect(() => r.unwrap()).toThrow(CompositeError);
    });

    it('Should merge in Error', () => {
      const r1 = ok(1);
      const r2 = error(
        new CompositeError(new BaseError('EXAMPLE ERROR')),
      );

      const r = r1.andTry(r2);

      expect(r.isErr()).toBeTruthy();
      expect(
        ((r as any).data.err as CompositeError<Error[]>).errors.length,
      ).toBe(1);
      expect(() => r.unwrap()).toThrow(CompositeError);
    });

    it('Should merge in Error', () => {
      const r1 = ok(1);
      const r2 = error(new BaseError('EXAMPLE ERROR'));

      const r = r2.andTry(r1);

      expect(r.isErr()).toBeTruthy();
      expect(() => r.unwrap()).toThrow(CompositeError);
    });

    it('Should merge in Error', () => {
      class CustomError extends Error {}
      const r1 = error(new CustomError('EXAMPLE ERROR 1'));
      const r2 = error(new BaseError('EXAMPLE ERROR 2'));

      const r = r1.andTry(r2);

      expect(r.isErr()).toBeTruthy();
      expect(
        ((r as any).data.err as CompositeError<Error[]>).errors.length,
      ).toBe(2);
      expect(
        ((r as any).data.err as CompositeError<Error[]>).errors[0],
      ).toBeInstanceOf(CustomError);
      expect(
        ((r as any).data.err as CompositeError<Error[]>).errors[1],
      ).toBeInstanceOf(BaseError);
      expect(() => r.unwrap()).toThrow(CompositeError);
    });

    it('Should merge in Error', () => {
      class CustomError extends Error {}
      const r1 = error(
        new CompositeError(new CustomError('EXAMPLE ERROR 1')),
      );
      const r2 = error(new BaseError('EXAMPLE ERROR 2'));

      const r = r2.andTry(r1);

      expect(r.isErr()).toBeTruthy();
      expect(
        ((r as any).data.err as CompositeError<Error[]>).errors.length,
      ).toBe(2);
      expect(
        ((r as any).data.err as CompositeError<Error[]>).errors[0],
      ).toBeInstanceOf(BaseError);
      expect(
        ((r as any).data.err as CompositeError<Error[]>).errors[1],
      ).toBeInstanceOf(CustomError);
      expect(() => r.unwrap()).toThrow(CompositeError);
    });

    it('Should merge in Error', () => {
      class CustomError extends Error {}
      const r1 = error(
        new CompositeError(new CustomError('EXAMPLE ERROR 1')),
      );
      const r2 = error(
        new CompositeError(new BaseError('EXAMPLE ERROR 2')),
      );

      const r = r1.andTry(r2);

      expect(r.isErr()).toBeTruthy();
      expect(
        ((r as any).data.err as CompositeError<Error[]>).errors.length,
      ).toBe(2);
      expect(
        ((r as any).data.err as CompositeError<Error[]>).errors[0],
      ).toBeInstanceOf(CustomError);
      expect(
        ((r as any).data.err as CompositeError<Error[]>).errors[1],
      ).toBeInstanceOf(BaseError);
      expect(() => r.unwrap()).toThrow(CompositeError);
    });
  });
});
