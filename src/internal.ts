export function indexedPath(here: string | number, inner: string): string {
  const herePart = typeof here === "number"
    ? `[${here}]`
    : `["${here}"]`;

  if (inner === "") {
    return herePart;
  } else if (inner.startsWith("[")) {
    return `${herePart}${inner}`;
  } else {
    return `${herePart}.${inner}`;
  }
}

export function memberPath(here: string, inner: string): string {
  if (inner === "") {
    return here;
  } else {
    return `${here}.${inner}`;
  }
}
