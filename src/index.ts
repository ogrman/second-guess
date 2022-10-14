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
