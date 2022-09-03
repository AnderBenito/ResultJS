import { error, ok, Result } from "./result";
import { CombinedResult, ResultData } from "./types";

export const isCombinedResult = <T extends unknown[]>(
  d: unknown
): d is CombinedResult<T> =>
  (d as CombinedResult<T>).__typename === "CombinedResult";

// export const wrapError = <E extends Error>(
//   error: E,
//   predecessor: Error
// ): WrappedError<E> => new WrappedError(error, predecessor);

export function catchErrorAndWrap<T, E extends Error = Error>(
  cb: () => T
): Result<T, E> {
  try {
    const result = cb();

    return ok(result);
  } catch (err) {
    return error(err);
  }
}

export async function catchErrorAndWrapAsync<T>(
  cb: () => Promise<T>
): Promise<Result<T>> {
  try {
    const result = await cb();

    return ok(result);
  } catch (err) {
    return error(err);
  }
}

export const isError = <T, E extends Error>(
  data: ResultData<T, E>
): data is { err: E } => {
  return (data as { err: Error }).err !== undefined;
};
