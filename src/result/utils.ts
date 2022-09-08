import { err, ok, Result } from "./result";

/**
 * Wraps a function and tries to execute it. Returns `Ok(t)` with the result `t` of the function if no errors are found. Otherwise returns `Err(e)`
 *
 * @param cb Callback function to wrap
 */
export function wrap<T, E>(cb: () => T): Result<T, E> {
  try {
    const result = cb();

    return ok(result);
  } catch (error) {
    return err(error);
  }
}

/**
 * Wraps an async function and tries to execute it. Returns `Ok(t)` with the result `t` of the function if no errors are found. Otherwise returns `Err(e)`
 *
 * @param cb Callback function to wrap
 */
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
