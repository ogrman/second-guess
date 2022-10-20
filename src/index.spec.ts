import * as chai from 'chai';
import { Err, Ok, Result } from 'ts-results';
import {
  allElements,
  allKeys,
  array,
  booleanVal,
  emptyVal,
  extractKeys,
  member,
  nullVal,
  numberVal,
  object,
  optional,
  or,
  ParseError,
  stringVal,
  undefinedVal,
} from '.';

const expect = chai.expect;

describe("stringVal", () => {
  it("should parse a string", () => {
    expect(stringVal("test").unwrap()).to.equal("test");
  });

  it("should fail when not receiving a string", () => {
    const val = 3;
    const result = stringVal(val).mapErr(err => {
      expect(err.expected).to.equal("string");
      expect(err.found).to.equal(JSON.stringify(val));
      expect(err.path).to.equal("");
    })
    expect(result.err).to.be.true;
  });
});

describe("numberVal", () => {
  it("should parse a number", () => {
    expect(numberVal(3).unwrap()).to.equal(3);
  });

  it("should fail when not receiving a number", () => {
    const val = "horse";
    const result = numberVal(val).mapErr(err => {
      expect(err.expected).to.equal("number");
      expect(err.found).to.equal(JSON.stringify(val));
      expect(err.path).to.equal("");
    })
    expect(result.err).to.be.true;
  });
});

describe("booleanVal", () => {
  it("should parse a number", () => {
    expect(booleanVal(false).unwrap()).to.equal(false);
  });

  it("should fail when not receiving a boolean", () => {
    const val = { "monkey": true };
    const result = booleanVal(val).mapErr(err => {
      expect(err.expected).to.equal("boolean");
      expect(err.found).to.equal(JSON.stringify(val));
      expect(err.path).to.equal("");
    })
    expect(result.err).to.be.true;
  });
});

describe("object", () => {
  it("should parse an Object", () => {
    const x = {"tree": "beard"};
    expect(object(x).unwrap()).to.eql(x);
  });

  it("should fail when not receiving an Object", () => {
    const result = object(["clown"]).mapErr(err => {
      expect(err.expected).to.equal("Object");
      expect(err.found).to.equal("[\"clown\"]");
      expect(err.path).to.equal("");
    })
    expect(result.err).to.be.true;
  })
});

describe("array", () => {
  it("should parse an Array", () => {
    const x = ["cat"];
    expect(array(x).unwrap()).to.eql(["cat"]);
  });

  it("should fail when not receiving an Array", () => {
    const result = array("clown").mapErr(err => {
      expect(err.expected).to.equal("Array");
      expect(err.found).to.equal("\"clown\"");
      expect(err.path).to.equal("");
    })
    expect(result.err).to.be.true;
  })
});

describe("undefinedVal", () => {
  it("should parse undefined", () => {
    expect(undefinedVal(undefined).unwrap()).to.eql(undefined);
  });

  it("shoould fail when not receiving undefined", () => {
    const result = undefinedVal(3).mapErr(err => {
      expect(err.expected).to.equal("undefined");
      expect(err.found).to.equal("3");
      expect(err.path).to.equal("");
    });
    expect(result.err).to.be.true;
  });
});

describe("nullVal", () => {
  it("should parse null", () => {
    expect(nullVal(null).unwrap()).to.eql(null);
  });

  it("should fail when not receiving null", () => {
    const result = nullVal(3).mapErr(err => {
      expect(err.expected).to.equal("null");
      expect(err.found).to.equal("3");
      expect(err.path).to.equal("");
    });
    expect(result.err).to.be.true;
  });
});

describe("optional", () => {
  it("should parse an optional value", () => {
    expect(optional(stringVal)("hello").unwrap()).to.equal("hello");
    expect(optional(stringVal)(undefined).unwrap()).to.equal(undefined);
  });

  it("should fail when parsing fails", () => {
    const result = optional(stringVal)(3).mapErr(err => {
      expect(err.expected).to.equal("string or undefined");
      expect(err.found).to.equal("3");
      expect(err.path).to.equal("");
    });
    expect(result.err).to.be.true;
  });
});

describe("emptyVal", () => {
  it("should parse null", () => {
    expect(emptyVal(undefined)(null).unwrap()).to.equal(undefined);
  });

  it("should parse undefined", () => {
    expect(emptyVal(null)(undefined).unwrap()).to.equal(null);
  });

  it("should fail when value is non-empty", () => {
    const result = emptyVal(null)(3);
    result.mapErr(err => {
      expect(err.expected).to.equal("undefined or null");
      expect(err.found).to.equal("3");
      expect(err.path).to.equal("");
    });
    expect(result.err).to.be.true;
  });
});

describe("or", () => {
  it("should return the first success when both succeed", () => {
    expect(or(
      _ => new Ok(1),
      _ => new Ok(2),
    )("something").unwrap())
      .to.equal(1);
  });

  it("should return the second when first fails", () => {
    expect(or(
      _ => new Err({ expected: "", found: "", path: "" }),
      _ => new Ok(2),
    )("something").unwrap())
      .to.equal(2);
  });

  it("should combine both errors when both fail", () => {
    const result = or(numberVal, booleanVal)("something").mapErr(err => {
      expect(err.expected).to.equal("number or boolean");
      expect(err.found).to.equal(JSON.stringify("something"));
      expect(err.path).to.equals("");
    });
    expect(result.err).to.be.true;
  });
});

describe("allElements", () => {
  it("should parse all elements in an array", () => {
    const arr: unknown[] = ["a", "b"];
    const result = allElements(stringVal)(arr);
    expect(result.ok).to.be.true;
    expect(result.unwrap()).to.eql(["a", "b"]);
  });

  it("should fail when one of the elements does not parse", () => {
    const result = allElements(stringVal)(["a", 3]).mapErr(err => {
      expect(err.expected).to.equal("string");
      expect(err.found).to.equal("3");
      expect(err.path).to.equal("[1]");
    });
    expect(result.err).to.be.true;
  });
});

describe("allKeys", () => {
  it("should parse all keys in an Object", () => {
    const obj: Record<string, unknown> = { a: "1", b: "2", c: "3"};
    const result = allKeys(stringVal)(obj);
    expect(result.ok).to.be.true;
    expect(result.unwrap()).to.eql({ a: "1", b: "2", c: "3" });
  });

  it("should fail when one of the elements does not parse", () => {
    const obj: Record<string, unknown> = { a: "1", b: 4, c: "3"};
    const result = allKeys(stringVal)(obj);
    result.mapErr(err => {
      expect(err.expected).to.equal("string");
      expect(err.found).to.equal("4");
      expect(err.path).to.equal("[\"b\"]");
    });
    expect(result.err).to.be.true;
  });
});

describe("member", () => {
  it("should parse a member", () => {
    const obj: Record<string, unknown> = { a: 1, b: 2 };
    const result = member("b", numberVal)(obj);
    expect(result.unwrap()).to.equal(2);
  });

  it("should fail when the member does not parse", () => {
    const obj: Record<string, unknown> = { a: 1, b: "two" };
    const result = member("b", numberVal)(obj).mapErr(err => {
      expect(err.expected).to.equal("number");
      expect(err.found).to.equal("\"two\"");
      expect(err.path).to.equal("b");
    });
    expect(result.err).to.be.true;
  });

  it("should fail when the member does not exist", () => {
    const obj: Record<string, unknown> = { a: 1 };
    const result = member("b", numberVal)(obj).mapErr(err => {
      expect(err.expected).to.equal("number");
      expect(err.found).to.equal("undefined");
      expect(err.path).to.equal("b");
    });
    expect(result.err).to.be.true;
  });
});

describe("extract", () => {
  it("should extract a field from an Object", () => {
    const object: Record<string, unknown> = { x: "horse" };
    expect(extractKeys({ x: stringVal })(object).unwrap())
      .to.eql({ x: "horse" });
  });

  it("should extract several fields from an Object", () => {
    const object: Record<string, unknown> = { x: "horse", y: "goat", z: 7 };
    expect(extractKeys({ x: stringVal, z: numberVal, })(object).unwrap())
      .to.eql({ x: "horse", z: 7 });
  });

  it("should fail when a member is not found", () => {
    const object: Record<string, unknown> = { x: "horse" };
    const result = extractKeys({ y: numberVal })(object);
    result.mapErr(err => {
      expect(err.expected).to.equal("number");
      expect(err.found).to.equal("undefined");
      expect(err.path).to.equal("y")
    });
    expect(result.err).to.be.true;
  });

  it("should fail when a parsing a member fails", () => {
    const object: Record<string, unknown> = { a: 3, x: "horse" };
    const result = extractKeys({ a: stringVal, x: stringVal })(object);
    result.mapErr(err => {
      expect(err.expected).to.equal("string");
      expect(err.found).to.equal("3");
      expect(err.path).to.equal("a");
    });
    expect(result.err).to.be.true;
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
      .andThen(record => member("x", numberVal)(record)
        .andThen(x => member("y", stringVal)(record)
          .andThen(y => member("zz", array)(record)
            .andThen(allElements(or(numberVal, booleanVal)))
              .andThen(zz => new Ok({
                x,
                y,
                zz,
              })))));
    expect(result.ok).to.be.true;
    expect(source).to.eql(result.val);
  }); 
});
