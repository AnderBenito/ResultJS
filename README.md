# ResultJS

- [ResultJS](#resultjs)
  * [Installation](#installation)
  * [Usage](#usage)
    + [Result](#result)
      - [Creation](#creation)
      - [Type safety and Narrowing](#type-safety-and-narrowing)
      - [Unwrap](#unwrap)
      - [UnwrapOr](#unwrapor)
      - [UnwrapOrElse](#unwraporelse)
      - [Map](#map)
      - [MapErr](#maperr)
      - [Ok method](#ok-method)
      - [Err method](#err-method)
      - [And operator method](#and-operator-method)
      - [Or operator method](#or-operator-method)
    + [Option](#option)
      - [Creation](#creation-1)
      - [Type safety and Narrowing](#type-safety-and-narrowing-1)
      - [Unwrap](#unwrap-1)
      - [Expect](#expect)
      - [UnwrapOr](#unwrapor-1)
      - [UnwrapOrElse](#unwraporelse-1)
      - [OkOr](#okor)
      - [Map](#map-1)
      - [Filter](#filter)
      - [Zip](#zip)
      - [Flatten](#flatten)
      - [And operator method](#and-operator-method-1)
      - [Or operator method](#or-operator-method-1)
      - [Xor operator method](#xor-operator-method)
  * [Motivation](#motivation)
    + [Custom error types](#custom-error-types)

## Installation

```
$ npm install resultjs
```

or

```
$ yarn add resultjs
```

## Usage

### Result

The `Result<T, E>` type encapsulates a value of type `T` with a possible error of type `E`. Let's see some examples.

#### Creation

To create an `Ok` result:

```ts
const okResult = ok(1);
```

To create an `Error` result:

```ts
const errResult = err("Wrong input!");
```

Both ok and err values can be of `any` type. In this case the `Ok` value type is number and `Err` value type is string. We could make an `Err` with the built in **Javascript** `Error` type:

```ts
const errResult = err(new Error("Wrong input!"));
```

#### Type safety and Narrowing

Let's say we are working with a `Result<number, Error>`:

```ts
const result: Result<number, Error> = returnsResult();

if(result.isOk()){
  // Typescript now knows that this result is of type Ok<number>
  // We can work safely with it
  console.log(result.getVal());
} else {
  // Typescript narrows the type and knows that is of type Err<Error>
  // We can controll the Error freely
  console.error(result.getErr());
}

// In contrast, we could check if it's Err
if(result.isErr()){
  // Typescript now knows that this result is of type Err<Error>
  // We can controll the Error freely
  console.error(result.getErr());
} else {
  // Typescript narrows the type and knows that is of type Ok<number>
  // We can work safely with it
  console.log(result.getVal());
}
```

`getVal` and `getErr` methods are only available when Typescript knows the concrete type of the `Result` for `Ok` and `Err` respectively.

#### Unwrap

The `unwrap` method extracts the contained value in `Result<T, E>` when is `Ok(t)`. In case of `Err` it throws the contained error.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myOkVal = okResult.unwrap();
console.log(myOkVal); // Prints 1

const myWrongVal = errResult.unwrap(); // Throws "Wrong input!"
```

#### UnwrapOr

The `unwrapOr` method extracts the contained value in `Result<T, E>` when is `Ok(t)`. In case of `Err` it returns the provided value.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myOkVal = okResult.unwrapOr(2);
console.log(myOkVal); // Prints 1

const myWrongVal = errResult.unwrapOr(2);
console.log(myWrongVal); // Prints 2
```

#### UnwrapOrElse

The `UnwrapOrElse` method extracts the contained value in `Result<T, E>` when is `Ok(t)`. In case of `Err` it returns the result of evaluating the provided function.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myOkVal = okResult.unwrapOrElse(() => 2);
console.log(myOkVal); // Prints 1

const myWrongVal = errResult.unwrapOrElse(() => 2);
console.log(myWrongVal); // Prints 2
```

#### Map

The `map` method transforms `Result<T, E>` to `Result<U, E>` by applying the provided function `f` to the contained value of `Ok(t)` and leaving `Err` values unchanged.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myOkVal = okResult
  .map((val) => val * 2).unwrap();

console.log(myOkVal); // Prints 2

const myWrongVal = errResult
  .map((val) => val * 2).unwrap(); // Throws "Wrong input!"
```

#### MapErr

The `mapErr` method transforms `Result<T, E>` to `Result<T, F>` by applying the provided function `f` to the contained value of `Err(err)` and leaving `Ok` values unchanged.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myOkVal = okResult
  .mapErr(
    (err) => err.message + " Value must be greater than 5!"
  )
  .unwrap();

console.log(myOkVal); // Prints 1

const myWrongVal = errResult
  .mapErr(
    (err) => err.message + " Value must be greater than 5!"
  )
  .unwrap(); // Throws "Wrong input! Value must be greater than 5!"
```

#### Ok method

The `ok` method transforms `Result<T,E>` into `Option<T>`, mapping `Ok(v)` to `Some(v)` and `Err(e)` to None.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const mySomeVal: Some<number> = okResult.ok();
const myNone: None = myWrongVal.ok();
```

#### Err method

The `err` method transforms `Result<T,E>` into `Option<E>`, mapping `Err(e)` to `Some(e)` and `Ok(v)` to None.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myNone: None = okResult.err();
const mySomeErr: Some<Error> = myWrongVal.err();
```

#### And operator method

The `and` method treats the `Result` as a boolean value, where `Ok` acts like true and `Err` acts like false.

The `and` method can produce a `Result<U, E>` value having a different inner type U than `Result<T, E>`.

```ts
const x = ok(2);
const y = err("late error");
x.and(y).unwrap() // Throws "late error"

const x = err("early error");
const y = ok(2);
x.and(y).unwrap() // Throws "early error"

const x = err("not a 2");
const y = err("late error");
x.and(y).unwrap() // Throws "not a 2"

const x = ok(2);
const y = ok("hello world");
x.and(y).unwrap() // Yields "hello world"
```

#### Or operator method

The `or` method treats the `Result` as a boolean value like the `and` method.

The `or` method can produce a `Result<T, F>` value having a different error type F than `Result<T, E>`.

```ts
const x = ok(2);
const y = err("late error");
x.or(y).unwrap() // Yields 2

const x = err("early error");
const y = ok(2);
x.or(y).unwrap() // Yields 2

const x = err("not a 2");
const y = err("late error");
x.or(y).unwrap() // Throws "late error"

const x = ok(2);
const y = ok("hello world");
x.or(y).unwrap() // Yields 2
```

### Option

The `Option<T>` type encapsulates a value of type `T` wich can be possibly undefined. Is a superposition of types `Some<T>` and `None`

#### Creation

To create a `Some` option:

```ts
const someValue = some(1);
```

To create a `None` option:

```ts
const noneValue = none();
```

#### Type safety and Narrowing

Let's say we are working with a `Option<number>`:

```ts
const opt: Option<number> = returnsOption();

if(result.isSome()){
  // Typescript now knows that this option is of type Some<number>
  // We can work safely with it
  console.log(result.getVal());
} else {
  // Typescript narrows the type and knows that is of type None
}

// In contrast, we could check if it's Err
if(result.isNone()){
  // Typescript now knows that this result is of type None
} else {
  // Typescript now knows that this option is of type Some<number>
  // We can work safely with it
  console.log(result.getVal());
}
```

`getVal` method is only available when Typescript knows the concrete type of the `Option` for `Some`.

#### Unwrap

The `unwrap` method extracts the contained value in `Option<T>` when is `Some`. If is `None` throws error with generic message.

```ts
const someOption = some(1);
const noneOption = none();

const value = someOption.unwrap();
console.log(value); // Prints 1

const noneValue = errResult.unwrap(); // Throws OptionUnwrapError
```

#### Expect

The `expect` method extracts the contained value in `Option<T>` when is `Some`. If is `None` throws an Error with the provided message.

```ts
const someOption = some(1);
const noneOption = none();

const value = someOption.expect();
console.log(value); // Prints 1

const noneValue = errResult.expect("Oops!"); // Throws "Oops!"
```

#### UnwrapOr

The `unwrapOr` method extracts the contained value in `Option<T>` when is `Some(t)`. In case of `None` it returns the provided value.

```ts
const someOption = ok(1);
const noneOption = none();

const someValue = someOption.unwrapOr(2);
console.log(someValue); // Prints 1

const noneValue = noneOption.unwrapOr(2);
console.log(noneValue); // Prints 2
```

#### UnwrapOrElse

The `UnwrapOrElse` method extracts the contained value in `Option<T>` when is `Some(t)`. In case of `None` it returns the result of evaluating the provided function.

```ts
const someOption = ok(1);
const noneOption = none();

const someValue = someOption.unwrapOrElse(() => 2);
console.log(someValue); // Prints 1

const noneValue = noneOption.unwrapOrElse(() => 2);
console.log(noneValue); // Prints 2
```

#### OkOr

Transforms an `Option<T>` to a `Result<T, E>`. Mapping `Some(v)` to `Ok(v)`, and `None` to `Err(err)` using the provided default err value.

```ts
const someOption = ok(1);
const noneOption = none();

const okResult: Result<number, string> = someOption.okOr("an error");
console.log(okResult.unwrap()); // Prints 1

const noneValue: Result<number, string> = noneOption.okOr("an error");
console.log(noneValue.unwrap()); // Throws "an error"
```

#### Map

The `map` method transforms `Option<T>` to `Option<U>` by applying the provided function `f` to the contained value of `Some(t)` and leaving `None` values unchanged.

```ts
const someOption = ok(1);
const noneOption = none();

const someValue = someOption
  .map((val) => val * 2).unwrap();

console.log(someValue); // Prints 2

const noneValue = noneOption
  .map((val) => val * 2).unwrap(); // Throws OptionUnwrapError
```

#### Filter

The `filter` method calls the provided predicate function `f` on the contained value `t` if the `Option` is `Some(t)`, and returns `Some(t)` if the function returns true; otherwise, returns `None`.

```ts
const someOption = ok(1);
const noneOption = none();

const someValue = someOption
  .filter((val) => true).unwrap();

console.log(someValue); // Prints 2

const filteredValue = someOption
  .filter((val) => false).unwrap(); // Throws OptionUnwrapError

const noneValue = noneOption
  .filter((val) => true).unwrap(); // Throws OptionUnwrapError

const noneFilteredValue = noneOption
.filter((val) => false).unwrap(); // Throws OptionUnwrapError
```

#### Zip

The `zip` method returns `Some([x, y])` if this is `Some(x)` and the provided Option value is `Some(y)`; otherwise, returns `None`

```ts
const x = some(1);
const y = some("hello");
console.log(x.zip(y).unwrap()); // Prints [1, "hello"]

const x = some(1);
const y = none();
console.log(x.zip(y).unwrap()); // Throws error

const x = none();
const y = some(1);
console.log(x.zip(y).unwrap()); // Throws error

const x = none();
const y = none();
console.log(x.zip(y).unwrap()); // Throws error
```

#### Flatten

The `flatten` method removes one level of nesting from an `Option<Option<T>>`

```ts
const opt1: Option<Option<number>> = some(some(1));
const flat1 = opt1.flatten(); // Yields Some(1);

const opt2: Option<Option<number>> = some(none());
const flat2 = opt2.flatten(); // Yields None;

const opt3: Option<Option<number>> = none();
const flat3 = opt3.flatten(); // Yields None;
```

#### And operator method

The `and` method treats the `Option` as a boolean value, where `Some` acts like true and `None` acts like false.

```ts
const x = some(2);
const y = none();
x.and(y).unwrap(); // Throws error

const x = none();
const y = some(2);
x.and(y).unwrap(); // Throws error

const x = none();
const y = none();
x.and(y).unwrap(); // Throws error

const x = some(2);
const y = some("hello world");
x.and(y).unwrap(); // Yields "hello world"
```

#### Or operator method

The `or` method treats the `Option` as a boolean value like the `and` method.

```ts
const x = some(2);
const y = none();
x.or(y).unwrap(); // Yields 2

const x = none();
const y = some(2);
x.or(y).unwrap(); // Yields 2

const x = none();
const y = none();
x.or(y).unwrap() // Throws "late error"

const x = some(2);
const y = some("hello world");
x.or(y).unwrap() // Yields 2
```

#### Xor operator method

The `xor` method treats the `Option` as a boolean value like the `and` and `or` methods.

```ts
const x = some(2);
const y = none();
x.xor(y).unwrap(); // Yields 2

const x = none();
const y = some(2);
x.xor(y).unwrap(); // Yields 2

const x = none();
const y = none();
x.xor(y).unwrap() // Throws "late error"

const x = some(2);
const y = some("hello world");
x.xor(y).unwrap() // Throws "late error"
```

## Motivation

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
  // getValue() is available to get the wrapped value
  console.log(mySqr.getValue()) // Prints: 2
} else {
  // Otherwise getErr() is available to get the wrapped error
  const error = mySqr.getErr()

  // Treat the error
  throw error
}
```

Another solution is to use the `unwrap()` method, wich if it is an Ok Result returns the value or in case of an Error Result throws the error as a traditional exception.

```ts
const okResult = getSquareRoot(4)
const errorResult = getSquareRoot(-2)

console.log(okResult.unwrap()) // Prints: 2

console.log(errorResult.unwrap()) // Throws exception
```

### Custom error types

```ts
function getSquareRoot(num: number): Result<number, InvalidSqrInput> {
  if (num < 0) return error(new InvalidSqrInput(num))

  return ok(Math.sqrt(num))
}
```

Note that with this type of `Result` we are always aware of the different types of errors that the API could return.
