import { Ok, Err, Result as TsResult } from 'ts-results';

type Result<T> = TsResult<T, ParseError>

export interface ParseError {
  path: string,
  expected: string,
  found: string,
}

function pe(path: string, expected: string, found: unknown): ParseError {
  return {
    path: path,
    expected: expected,
    found: JSON.stringify(found),
  };
}

export function string(x: unknown): Result<string> {
  if (typeof x === "string") {
    return new Ok(x);
  } else {
    return new Err(pe("", "string", x));
  }
}

export function number(x: unknown): Result<number> {
  if (typeof x === "number") {
    return new Ok(x);
  } else {
    return new Err(pe("", "number", x));
  }
}

export function boolean(x: unknown): Result<boolean> {
  if (typeof x === "boolean") {
    return new Ok(x);
  } else {
    return new Err(pe("", "boolean", x));
  }
}

export function object(x: unknown): Result<Record<string, unknown>> {
  if ((x instanceof Array) || !(x instanceof Object)) {
    return new Err(pe("", "Object", x));
  } else {
    return new Ok(x as Record<string, unknown>);
  }
}

export function array(x: unknown): Result<unknown[]> {
  if (!Array.isArray(x)) {
    return new Err(pe("", "Array", x));
  } else {
    return new Ok(x);
  }
}

export function undefinedVal(x: unknown): Result<undefined> {
  if (x === undefined) {
    return new Ok(x);
  } else {
    return new Err(pe("", "undefined", x));
  }
}

export function nullVal(x: unknown): Result<null> {
  if (x === null) {
    return new Ok(x);
  } else {
    return new Err(pe("", "null", x));
  }
}

export type Parse<T> = (x: unknown) => Result<T>;

export function or<T, U>(
  p1: Parse<T>,
  p2: Parse<U>,
): Parse<T | U> {
  return x => {
    const r1 = p1(x);
    if (r1.ok === true) {
      return new Ok(r1.val);
    } else if (r1.ok === false) {
      const r2 = p2(x);
      if (r2.ok == true) {
        return r2;
      } else if (r2.ok === false) {
        const expected = [r1.val.expected, r2.val.expected].join(" or ");
        return new Err(pe("", expected, x));
      }
    }
  }
}

export function emptyVal<T>(x: unknown, produce: T): Result<T> {
  return or(undefinedVal, nullVal)(x).map(_ => produce);
}

export function member<T>(
  x: Record<string, unknown>,
  name: string,
  parse: Parse<T>,
): Result<T> {
  const result = parse(x[name]);
  if (result.ok === true) {
    return result;
  } else if (result.ok === false) {
    const err = result.val;
    return new Err({
      path: [name, err.path].join("."),
      expected: err.expected,
      found: err.found
    });
  }
}

export function allElements<T>(
  array: unknown[],
  parse: Parse<T>,
): Result<T[]> {
  const result = [];
  for (let i = 0; i < array.length; ++i) {
    const r = parse(array[i]);
    if (r.ok === true) {
      result.push(r.val);
    } else if (r.ok === false) {
      return new Err(pe(
        `[${i}]`,
        r.val.expected,
        r.val.found,
      ));
    }
  }
  return new Ok(result);
}
