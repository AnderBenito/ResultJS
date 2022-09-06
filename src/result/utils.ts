import { error, ok, Result } from "./result";

export function wrap<T, E>(cb: () => T): Result<T, E> {
  try {
    const result = cb();

    return ok(result);
  } catch (err) {
    return error(err);
  }
}

export async function wrapAsync<T, E>(
  cb: () => Promise<T>
): Promise<Result<T, E>> {
  try {
    const result = await cb();

    return ok(result);
  } catch (err) {
    return error(err);
  }
}
