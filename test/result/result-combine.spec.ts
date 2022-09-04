import { all, error, ok, Result, tryAll, tryAny } from "../../src";

class BaseError extends Error {}

describe("Result test", () => {
  describe("Test all", () => {
    it("Should all and return OK", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[]> = ok(["hello"]);

      const r = all(r1, r2);

      expect(r.isOk()).toBeTruthy();
      if (r.isOk()) {
        const [a, b] = r.getValue();

        expect(a).toBe(1);
        expect(b[0]).toBe("hello");
      }
    });

    it("Should all with Ok and Error and return Error", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[]> = error(new Error("2"));

      const r = all(r1, r2);

      expect(r.isErr()).toBeTruthy();
      if (r.isErr()) {
        const err = r.getErr();
        expect(err.message).toBe("2");
      }
    });

    it("Should all with Error and Error and return Error", () => {
      const r1: Result<number> = error(new Error("1"));
      const r2: Result<string[]> = error(new Error("2"));

      const r = all(r1, r2);

      expect(r.isErr()).toBeTruthy();
      if (r.isErr()) {
        const err = r.getErr();
        expect(err.message).toBe("1");
      }
    });
  });
  describe("Test tryAll", () => {
    it("Should tryAll and return OK", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[]> = ok(["hello"]);

      const r = tryAll(r1, r2);

      expect(r.isOk()).toBeTruthy();
      if (r.isOk()) {
        const [a, b] = r.getValue();

        expect(a).toBe(1);
        expect(b[0]).toBe("hello");
      }
    });

    it("Should tryAll with Ok and Error and return Error", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[]> = error(new Error("Error"));

      const r = tryAll(r1, r2);

      expect(r.isErr()).toBeTruthy();
      if (r.isErr()) {
        const err = r.getErr();
        expect(err.errors.length).toBe(1);
      }
    });

    it("Should tryAll with Error and Error and return Error", () => {
      const r1: Result<number> = error(new Error("Error"));
      const r2: Result<string[]> = error(new Error("Error"));

      const r = tryAll(r1, r2);

      expect(r.isErr()).toBeTruthy();
      if (r.isErr()) {
        const err = r.getErr();
        expect(err.errors.length).toBe(2);
      }
    });
  });
  describe("Test tryAny", () => {
    it("Should tryAny and return OK", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[]> = ok(["hello"]);

      const r = tryAny(r1, r2);

      expect(r.isOk()).toBeTruthy();
      if (r.isOk()) {
        const val = r.getValue();

        expect(val).toBe(1);
      }
    });

    it("Should tryAny with Ok and Error and return Ok", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[]> = error(new Error("2"));

      const r = tryAny(r1, r2);

      expect(r.isOk()).toBeTruthy();
      if (r.isOk()) {
        const val = r.getValue();

        expect(val).toBe(1);
      }
    });

    it("Should tryAny with Error and Ok and return Ok", () => {
      const r1: Result<string[]> = error(new Error("1"));
      const r2: Result<number, BaseError> = ok(2);

      const r = tryAny(r1, r2);

      expect(r.isOk()).toBeTruthy();
      if (r.isOk()) {
        const val = r.getValue();

        expect(val).toBe(2);
      }
    });

    it("Should tryAny with Error and Error and return Error", () => {
      const r1: Result<number> = error(new Error("1"));
      const r2: Result<string[]> = error(new Error("2"));

      const r = tryAny(r1, r2);

      expect(r.isErr()).toBeTruthy();
      if (r.isErr()) {
        const err = r.getErr();
        expect(err.errors.length).toBe(2);
      }
    });
  });
});

// describe("Merging and combining", () => {
//   it("Should merge in OK", () => {
//     const r1: Result<number> = ok(1);
//     const r2: Result<string[]> = ok(["true"]);

//     const r = r1.andTry(r2);

//     expect(r.isErr()).toBeFalsy();
//   });

//   it("Should merge in Error", () => {
//     const r1 = ok(1);
//     const r2 = error(new BaseError("EXAMPLE ERROR"));

//     const r = r1.andTry(r2);

//     expect(r.isErr()).toBeTruthy();
//     expect(() => r.unwrap()).toThrow(CompositeError);
//   });

//   it("Should merge in Error", () => {
//     const r1 = ok(1);
//     const r2 = error(new CompositeError(new BaseError("EXAMPLE ERROR")));

//     const r = r1.andTry(r2);

//     expect(r.isErr()).toBeTruthy();
//     if (r.isErr()) {
//       expect((r.getErr() as CompositeError<Error[]>).errors.length).toBe(1);
//       expect(() => r.unwrap()).toThrow(CompositeError);
//     }
//   });

//   it("Should merge in Error", () => {
//     const r1 = ok(1);
//     const r2 = error(new BaseError("EXAMPLE ERROR"));

//     const r = r2.andTry(r1);

//     expect(r.isErr()).toBeTruthy();
//     expect(() => r.unwrap()).toThrow(CompositeError);
//   });

//   it("Should merge in Error", () => {
//     class CustomError extends Error {}
//     const r1 = error(new CustomError("EXAMPLE ERROR 1"));
//     const r2 = error(new BaseError("EXAMPLE ERROR 2"));

//     const r = r1.andTry(r2);

//     expect(r.isErr()).toBeTruthy();

//     if (r.isErr()) {
//       expect((r.getErr() as CompositeError<Error[]>).errors.length).toBe(2);
//       expect(
//         (r.getErr() as CompositeError<Error[]>).errors[0]
//       ).toBeInstanceOf(CustomError);
//       expect(
//         (r.getErr() as CompositeError<Error[]>).errors[1]
//       ).toBeInstanceOf(BaseError);
//       expect(() => r.unwrap()).toThrow(CompositeError);
//     }
//   });

//   it("Should merge in Error", () => {
//     class CustomError extends Error {}
//     const r1 = error(new CompositeError(new CustomError("EXAMPLE ERROR 1")));
//     const r2 = error(new BaseError("EXAMPLE ERROR 2"));

//     const r = r2.andTry(r1);

//     expect(r.isErr()).toBeTruthy();
//     if (r.isErr()) {
//       expect((r.getErr() as CompositeError<Error[]>).errors.length).toBe(2);
//       expect(
//         (r.getErr() as CompositeError<Error[]>).errors[0]
//       ).toBeInstanceOf(BaseError);
//       expect(
//         (r.getErr() as CompositeError<Error[]>).errors[1]
//       ).toBeInstanceOf(CustomError);
//       expect(() => r.unwrap()).toThrow(CompositeError);
//     }
//   });

//   it("Should merge in Error", () => {
//     class CustomError extends Error {}
//     const r1 = error(new CompositeError(new CustomError("EXAMPLE ERROR 1")));
//     const r2 = error(new CompositeError(new BaseError("EXAMPLE ERROR 2")));

//     const r = r1.andTry(r2);

//     expect(r.isErr()).toBeTruthy();

//     if (r.isErr()) {
//       expect((r.getErr() as CompositeError<Error[]>).errors.length).toBe(2);
//       expect(
//         (r.getErr() as CompositeError<Error[]>).errors[0]
//       ).toBeInstanceOf(CustomError);
//       expect(
//         (r.getErr() as CompositeError<Error[]>).errors[1]
//       ).toBeInstanceOf(BaseError);
//       expect(() => r.unwrap()).toThrow(CompositeError);
//     }
//   });
// });
