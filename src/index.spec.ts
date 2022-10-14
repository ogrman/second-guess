import { array, boolean, nullVal, number, object, string, undefinedVal } from '.';

import * as chai from 'chai';

const expect = chai.expect;

describe("string", () => {
  it("should parse a string", () => {
    expect(string("test").unwrap()).to.equal("test");
  });

  it("should fail when not receiving a string", () => {
    expect(string(3).err).be.true;
  });
});

describe("number", () => {
  it("should parse a number", () => {
    expect(number(3).unwrap()).to.equal(3);
  });

  it("should fail when not receiving a number", () => {
    expect(number("horse").err).to.be.true;
  });
});

describe("boolean", () => {
  it("should parse a number", () => {
    expect(boolean(false).unwrap()).to.equal(false);
  });

  it("should fail when not receiving a boolean", () => {
    expect(boolean({"monkey": true}).err).to.be.true;
  });
});

describe("object", () => {
  it("should parse an Object", () => {
    const x = {"tree": "beard"};
    expect(object(x).unwrap()).to.eql(x);
  });

  it("should fail when not receiving an Object", () => {
    expect(object(["clown"]).err).to.be.true;
  })
});

describe("array", () => {
  it("should parse an Array", () => {
    const x = ["cat"];
    expect(array(x).unwrap()).to.eql(["cat"]);
  });

  it("should fail when not receiving an Object", () => {
    expect(array("clown").err).to.be.true;
  })
});

describe("undefinedVal", () => {
  it("should parse undefined", () => {
    expect(undefinedVal(undefined).unwrap()).to.eql(undefined);
  });

  it("shoould fail when not receiving undefined", () => {
    expect(undefinedVal(null).err).to.be.true;
  });
});

describe("nullVal", () => {
  it("should parse null", () => {
    expect(nullVal(null).unwrap()).to.eql(null);
  });

  it("should fail when not receiving null", () => {
    expect(nullVal(3).err).to.be.true;
  });
});
