import { Ok, Err, Result as TsResult } from 'ts-results';
import { indexedPath, memberPath } from './internal';

export type Result<T> = TsResult<T, ParseError>
export type Parse<Output, Input = unknown> = (x: Input) => Result<Output>;

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
    if (r1.ok) {
      return new Ok(r1.val);
    } else {
      const r2 = p2(x);
      if (r2.ok) {
        return r2;
      } else {
        const expected = [r1.val.expected, r2.val.expected].join(" or ");
        return new Err(parseError("", expected, x));
      }
    }
  }
}

export function chain<ParseOutput, ParseInput, TransformOutput>(
  parse: Parse<ParseOutput, ParseInput>,
  transform: Parse<TransformOutput, ParseOutput>,
): Parse<TransformOutput, ParseInput> {
  return x => parse(x).andThen(transform);
}

export function optional<T>(parse: Parse<T>): Parse<T | undefined> {
  return or(parse, undefinedVal);
}

export function emptyVal<T>(defaultValue: T): Parse<T> {
  return x => or(undefinedVal, nullVal)(x).map(_ => defaultValue);
}

export function member<T>(
  name: string,
  parse: Parse<T>,
): Parse<T, Record<string, unknown>> {
  return x => {
    const result = parse(x[name]);
    if (result.ok) {
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
}

export function allElements<T>(
  parse: Parse<T>,
): Parse<T[], unknown[]> {
  return array => {
    const result = [];
    for (let i = 0; i < array.length; ++i) {
      const r = parse(array[i]);
      if (r.ok) {
        result.push(r.val);
      } else {
        return new Err({
          path: indexedPath(i, r.val.path),
          expected: r.val.expected,
          found: r.val.found,
        });
      }
    }
    return new Ok(result);
  }
}

export function allFields<T>(
  parse: Parse<T>,
): Parse<Record<string, T>, Record<string, unknown>> {
  return record => {
    const result: Record<string, T> = {};
    for (const key in record) {
      const r = parse(record[key]);
      if (r.ok) {
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
}

type MappedObject<Object> = {
  [Key in keyof Object]: Parse<Object[Key]>;
};

export function fields<T extends {}>(
  parsed: MappedObject<T>,
): Parse<T, Record<string, unknown>> {
  return record => {
    const result = {} as T; // unsafe
    for (const property in parsed) {
      const parser = parsed[property];
      const parseResult = parser(record[property]);
      if (parseResult.ok === true) {
        result[property] = parseResult.val;
      } else {
        const err = parseResult.val;
        return new Err({
          path: memberPath(property, err.path),
          expected: err.expected,
          found: err.found,
        });
      }
    }
    return new Ok(result);
  };
}

type MappedTuple<Tuple extends [...any[]]> = {
  [Index in keyof Tuple]: Parse<Tuple[Index]>
};

export function elements<T extends [...any[]]>(
  parsed: MappedTuple<T>,
): Parse<T, unknown[]> {
  return array => {
    const result = [] as any as T; // unsafe
    for (let index = 0; index < parsed.length; ++index) {
      const parser = parsed[index];
      const parseResult = parser(array[index]);
      if (parseResult.ok === true) {
        result[index] = parseResult.val;
      } else {
        const err = parseResult.val;
        return new Err({
          path: indexedPath(index, err.path),
          expected: err.expected,
          found: err.found,
        });
      }
    }
    return new Ok(result);
  };
}
