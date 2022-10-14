import * as chai from 'chai';

import { indexedPath, memberPath } from './internal';

const expect = chai.expect;

describe("indexedPath", () => {
  it("should add a numeric index to the path", () => {
    expect(indexedPath(3, "")).to.equal("[3]");
    expect(indexedPath(3, "horse")).to.equal("[3].horse");
  });

  it("should add a string key to the path", () => {
    expect(indexedPath("horse", "")).to.equal("[\"horse\"]");
    expect(indexedPath("horse", "goat")).to.equal("[\"horse\"].goat");
  });
});

describe("memberPath", () => {
  it("should add a member to the path", () => {
    expect(memberPath("horse", "")).to.equal("horse");
    expect(memberPath("horse", "goat")).to.equal("horse.goat");
  });
});
