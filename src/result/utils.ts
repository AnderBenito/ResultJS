import { err, ok, Result } from "./result";

export function wrap<T, E>(cb: () => T): Result<T, E> {
  try {
    const result = cb();

    return ok(result);
  } catch (error) {
    return err(error);
  }
}

export async function wrapAsync<T, E>(
  cb: () => Promise<T>
): Promise<Result<T, E>> {
  try {
    const result = await cb();

    return ok(result);
  } catch (error) {
    return err(error);
  }
}
