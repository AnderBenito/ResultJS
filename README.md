# ResultJS


## The Result type

The `Result<T, E>` type encapsulates a value of type `T` with a possible error of type `E`. Let's see some examples.

Traditionally a function that could possibly return an error would be:

```ts
function getSquareRoot(num: number): number {
  if (num < 0) throw new Error("Invalid negative number")

  return Math.sqrt(num)
}

// The API tell's us that this function returns a number
const mySqr = getSquareRoot(-2)
```

And this is OK but when we expose this square root API the user does not know wether this function throws an error or what type of error it is.

If we encapsulate the return value in a `Result` type:

```ts
function getSquareRoot(num: number): Result<number> {
  if (num < 0) return error(new Error("Invalid negative number"))

  return ok(Math.sqrt(num))
}

// mySqr is not a number. Is a Result<number, Error>
// So in order to use it we must check explicitely if it is a valid value or an Error
const mySqr = getSquareRoot(-2)
```

Here we are returning a `Result` wrapping the error we would have throught with the `error()` function. And returning an Ok result wrapping the valid value with the `ok()` function.

The value of `mySqr` is not directly accesible since we don't know if it contains a valid value or error. We need to explicitely check:

```ts
const mySqr = getSquareRoot(4)

if(mySqr.isOk()){
  // TS Compiler narrows value
  // and getValue() is available to get the wrapped value
  // Prints: 2
  console.log(mySqr.getValue())
} else {
  // Otherwise getErr() is available to get the wrapped error
  const error = mySqr.getErr()

  // Treat the error
  throw error
}
```

Another solution is to use the `unwrap()` method, wich if it is an Ok Result returns the value or in case of an Error Result throws the error as a traditional exception.

```ts
const mySqr = getSquareRoot(4)

// Prints: 2
console.log(mySqr.unwrap())
```

### Custom error types

```ts
function getSquareRoot(num: number): Result<number, InvalidSqrInput> {
  if (num < 0) return error(new InvalidSqrInput(num))

  return ok(Math.sqrt(num))
}
```

Note that with this type of `Result` we are always aware of the different types of errors that the API could return.
