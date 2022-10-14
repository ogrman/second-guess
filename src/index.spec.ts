import * as chai from 'chai';
import { Err, Ok, Result } from 'ts-results';

import {
  allElements,
  array,
  boolean,
  emptyVal,
  member,
  nullVal,
  number,
  object,
  optional,
  or,
  ParseError,
  string,
  undefinedVal
} from '.';

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

describe("optional", () => {
  it("should parse an optional value", () => {
    expect(optional(string)("hello").unwrap()).to.equal("hello");
    expect(optional(string)(undefined).unwrap()).to.equal(undefined);
  });

  it("should fail when parsing fails", () => {
    expect(optional(string)(3).err).to.be.true;
  });
});

describe("emptyVal", () => {
  it("should parse null", () => {
    expect(emptyVal(null, undefined).unwrap()).to.eql(undefined);
  });

  it("should parse undefined", () => {
    expect(emptyVal(undefined, null).unwrap()).to.eql(null);
  });

  it("should fail when value is non-empty", () => {
    expect(emptyVal(3, null).err).to.be.true;
  });
});

describe("or", () => {
  it("should return the first success when both succeed", () => {
    expect(or(x => new Ok(1), x => new Ok(2))("something").unwrap())
      .to.equal(1);
  });

  it("should return the second when first fails", () => {
    expect(or(
      x => new Err(null as ParseError),
      x => new Ok(2),
    )("something").unwrap())
      .to.equal(2);
  });

  it("should combine both errors when both fail", () => {
    const r = or(number, boolean)("something").mapErr(pe => {
      expect(pe.expected).to.equal("number or boolean");
      expect(pe.found).to.equal(JSON.stringify("something"));
    });
    expect(r.err).to.be.true;
  });
});

describe("allElements", () => {
  it("should parse all elements in an array", () => {
    const arr: unknown[] = ["a", "b"];
    const r = allElements(arr, string);
    expect(r.ok).to.be.true;
    expect(r.unwrap()).to.eql(["a", "b"]);
  });

  it("should fail when one of the elements does not parse", () => {
    const r = allElements(["a", 3], string).mapErr(pe => {
      expect(pe.expected).to.equal("string");
      expect(pe.path).to.equal("[1]");
    });
    expect(r.err).to.be.true;
  });
});

describe("parsing structures", () => {
  it("should parse a simple structure", () => {
    interface Test {
      x: number,
      y: string,
      zz: (number | boolean)[],
    };
    const source: unknown = {
      x: 3,
      y: "data",
      zz: [5, false],
    };
    const result: Result<Test, ParseError> = object(source)
      .andThen(record => member(record, "x", number)
          .andThen(x => member(record, "y", string)
            .andThen(y => member(record, "zz", array)
              .andThen(zz => allElements(zz, or(number, boolean))
                .map(zz => ({
                  x: x,
                  y: y,
                  zz: zz,
                }))))));
    expect(result.ok).to.be.true;
    expect(source).to.eql(result.val);
  }); 
});

describe("examples", () => {
  it("parse a number", () => {
    console.log(number(3));
    console.log(number("horse"));
  });

  it("parse an object with fields", () => {
    const parse = (x: unknown) => object(x)
      .andThen(record => member(record, "x", number)
        .andThen(x => member(record, "y", string)
          .map(y => ({ x, y }))));

    console.log(parse({ x: 3, y: "banana" }));
    console.log(parse({ x: 3 }));
  });
});
