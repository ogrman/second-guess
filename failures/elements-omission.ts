import { elements, numberVal, Parse } from "../src";

export const parser: Parse<[
  number,
  string,
], unknown[]> = elements([
  numberVal,
] as [
  Parse<number>,
]);
