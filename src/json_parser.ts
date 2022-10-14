export type Result<T> = { ok: true, data: T} | { ok: false, error: string };

export function ok<T>(x: T): Result<T> {
  return { ok: true, data: x };
};

export function err<T>(err: string): Result<T> {
  return { ok: false, error: err };
}

export function unwrap<T>(x: Result<T>) {
  if (x.ok === true) {
    return x.data;
  } else {
    throw new Error("unwrap called on error: " + x.error);
  }
}

export class Parser<T> {
  private typeParser: (_: unknown, stack: string[]) => T;

  constructor(typeParser: (_: unknown, stack: string[]) => T) {
    this.typeParser = typeParser;
  }

  parse(data: unknown): Result<T> {
    const stack: string[] = [];
    try {
      return ok(this.typeParser(data, stack));
    } catch (error: any) {
      let msg = stack.length > 0 ? stack.join(".") + ": ": "";
      if (error instanceof Error) {
        msg += error.message;
      } else if (typeof error === "string") {
        msg += error;
      } else {
        msg += "parse error";
      }
      return err<T>(msg);
    }
  }
}

export function assertMember<T>(
  object: Record<string, unknown>,
  member: string,
  stack: string[],
  parse: (_: unknown) => T,
): T {
  stack.push(member);
  const result = parse(object[member]);
  stack.pop();
  return result;
}

export function assertArrayContents<T>(
  array: unknown[],
  stack: string[],
  parse: (_: unknown, stack: string[]) => T,
): T[] {
  return array.map((v, i) => {
    stack.push(i.toString());
    const result = parse(v, stack);
    stack.pop();
    return result;
  })
}

export function assertObjectContents<T>(
  object: Record<string, unknown>,
  stack: string[],
  parse: (_: unknown, stack: string[]) => T,
): Record<string, T> {
  const result: Record<string, T> = {};
  for (const key in object) {
    stack.push(key);
    result[key] = parse(object[key], stack);
    stack.pop();
  }
  return result;
}

export function assertObject(x: unknown): Record<string, unknown> {
  if ((x instanceof Array) || !(x instanceof Object)) {
    fail("Expected an Object", x);
  }
  return x as Record<string, unknown>;
}

export function assertArray(x: unknown): unknown[] {
  if (!Array.isArray(x)) {
    fail("Expected an array", x);
  }
  return x;
}

export function assertString(x: unknown): string {
  if (typeof x !== "string") {
    fail("Expected a string", x);
  }
  return x;
}

export function assertNumber(x: unknown): number {
  if (typeof x !== "number") {
    fail("Expected a number", x);
  }
  return x;
}

export function assertBoolean(x: unknown): boolean {
  if (typeof x !== "boolean") {
    fail("Expected a boolean", x);
  }
  return x;
}

export function fail(msg: string, value: unknown): never {
  throw new Error(msg + ", got: " + JSON.stringify(value));
}

export function isEmpty(x: unknown): x is null | undefined {
  return x === null || x === undefined;
}
