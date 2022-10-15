import { Ok, Err, Result as TsResult } from 'ts-results';
import { indexedPath, memberPath } from './internal';

export type Result<T> = TsResult<T, ParseError>
export type Parse<T> = (x: unknown) => Result<T>;

export interface ParseError {
  path: string,
  expected: string,
  found: string,
}

function parseError(
  path: string,
  expected: string,
  found: unknown,
): ParseError {
  return {
    path: path,
    expected: expected,
    found: found === undefined
      ? "undefined"
      : JSON.stringify(found),
  };
}

export function stringVal(x: unknown): Result<string> {
  if (typeof x === "string") {
    return new Ok(x);
  } else {
    return new Err(parseError("", "string", x));
  }
}

export function numberVal(x: unknown): Result<number> {
  if (typeof x === "number") {
    return new Ok(x);
  } else {
    return new Err(parseError("", "number", x));
  }
}

export function booleanVal(x: unknown): Result<boolean> {
  if (typeof x === "boolean") {
    return new Ok(x);
  } else {
    return new Err(parseError("", "boolean", x));
  }
}

export function object(x: unknown): Result<Record<string, unknown>> {
  if ((x instanceof Array) || !(x instanceof Object)) {
    return new Err(parseError("", "Object", x));
  } else {
    return new Ok(x as Record<string, unknown>);
  }
}

export function array(x: unknown): Result<unknown[]> {
  if (!Array.isArray(x)) {
    return new Err(parseError("", "Array", x));
  } else {
    return new Ok(x);
  }
}

export function undefinedVal(x: unknown): Result<undefined> {
  if (x === undefined) {
    return new Ok(x);
  } else {
    return new Err(parseError("", "undefined", x));
  }
}

export function nullVal(x: unknown): Result<null> {
  if (x === null) {
    return new Ok(x);
  } else {
    return new Err(parseError("", "null", x));
  }
}

export function or<T, U>(
  p1: Parse<T>,
  p2: Parse<U>,
): Parse<T | U> {
  return x => {
    const r1 = p1(x);
    if (r1.ok === true) {
      return new Ok(r1.val);
    } else {
      const r2 = p2(x);
      if (r2.ok == true) {
        return r2;
      } else {
        const expected = [r1.val.expected, r2.val.expected].join(" or ");
        return new Err(parseError("", expected, x));
      }
    }
  }
}

export function optional<T>(parse: Parse<T>): Parse<T | undefined> {
  return or(parse, undefinedVal);
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
  } else {
    const err = result.val;
    return new Err({
      path: memberPath(name, err.path),
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
      return new Err({
        path: indexedPath(i, r.val.path),
        expected: r.val.expected,
        found: r.val.found,
      });
    }
  }
  return new Ok(result);
}

export function allKeys<T>(
  record: Record<string, unknown>,
  parse: Parse<T>,
): Result<Record<string, T>> {
  const result: Record<string, T> = {};
  for (const key in record) {
    const r = parse(record[key]);
    if (r.ok === true) {
      result[key] = r.val;
    } else {
      return new Err({
        path: indexedPath(key, r.val.path),
        expected: r.val.expected,
        found: r.val.found,
      });
    }
  }
  return new Ok(result);
}

type PropertyType<T, PropertyName extends keyof T> = T[PropertyName];

type Parsed<T> = {
  [PropertyName in keyof T]: Parse<T[PropertyName]>
};

function f(x: { x: string }): Parsed<{x: string}> {
  return { x: stringVal };
}

export function extractKeys<T>(
  record: Record<string, unknown>,
  parsed: Parsed<T>,
): Result<T> {
  const result = {} as T; // unsafe
  for (const property in parsed) {
    const parser = parsed[property];
    const parseResult = parser(record[property]);
    if (parseResult.ok === true) {
      result[property] = parseResult.val;
    } else if (parseResult.ok === false) {
      const err = parseResult.val;
      return new Err({
        path: memberPath(property, err.path),
        expected: err.expected,
        found: err.found,
      });
    }
  }
  return new Ok(result);
}
