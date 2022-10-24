import { fields, numberVal, Parse } from "../src";

export const parser: Parse<{
  horse: string,
  cat: number,
}, Record<string, unknown>> = fields({
  cat: numberVal,
});
