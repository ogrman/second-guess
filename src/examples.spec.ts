import { Err, Ok, Result } from 'ts-results';
import {
  allElements,
  allFields,
  array,
  booleanVal,
  chain,
  elements,
  fields,
  numberVal,
  object,
  optional,
  Parse,
  ParseError,
  stringVal,
} from '.';

function exampleOne() {
  interface Animal {
    type: "horse" | "duck",
    name: string,
    age: number,
    licensedToKill: boolean,
    nickname: string | undefined,
  }

  const animalParser = (x: unknown) => object(x)
    .andThen(fields({
      type: chain(stringVal, x => {
        if (x === "horse" || x === "duck") {
          return new Ok(x as typeof x);
        } else {
          return new Err({
            expected: "horse or duck",
            found: JSON.stringify(x),
            path: "",
          });
        }
      }),
      name: stringVal,
      age: numberVal,
      licensedToKill: booleanVal,
      nickname: optional(stringVal),
    }));
  
  const unknownAnimal: unknown = {
    type: "horse",
    name: "Carl",
    age: 13,
    licensedToKill: true,
    nickname: "Lightning",
  };

  const carlTheHorse: Result<Animal, ParseError> =
    animalParser(unknownAnimal);

  console.log(carlTheHorse.unwrap());

  // =>
  // {
  //   type: 'horse',
  //   name: 'Carl',
  //   age: 13,
  //   licensedToKill: true,
  //   nickname: 'Lightning'
  // }

  const cursedBeast: unknown = {
    type: "duck",
    name: "Belzeebub",
    age: 7056,
    licensedToKill: false,
    nickname: ["The Dark One", "Unlicensed Killer"],
  };

  animalParser(cursedBeast).mapErr(err => console.log(err));

  // =>
  // {
  //   path: 'nickname',
  //   expected: 'string or undefined',
  //   found: '["The Dark One","Unlicensed Killer"]'
  // }

  const unknownFowl: unknown = {
    type: "duck",
    name: "Boots",
    age: 2,
    licensedToKill: false,
  };

  const myAnimals = array([unknownAnimal, unknownFowl] as unknown)
    .andThen(allElements(animalParser))
    .unwrap();

  console.log(myAnimals);

  // =>
  // [
  //   {
  //     type: 'horse',
  //     name: 'Carl',
  //     age: 13,
  //     licensedToKill: true,
  //     nickname: 'Lightning'
  //   },
  //   {
  //     type: 'duck',
  //     name: 'Boots',
  //     age: 2,
  //     licensedToKill: false,
  //     nickname: undefined
  //   }
  // ]

  const animalRegistry = object({
    "a": unknownAnimal,
    "b": unknownFowl,
  } as unknown)
    .andThen(allFields(animalParser))
    .unwrap();

  console.log(animalRegistry);

  // =>
  // {
  //   a: {
  //     type: 'horse',
  //     name: 'Carl',
  //     age: 13,
  //     licensedToKill: true,
  //     nickname: 'Lightning'
  //   },
  //   b: {
  //     type: 'duck',
  //     name: 'Boots',
  //     age: 2,
  //     licensedToKill: false,
  //     nickname: undefined
  //   }
  // }

  object({
    "a": unknownAnimal,
    "b": unknownFowl,
    "c": { "bananas": "yes" },
  } as unknown)
    .andThen(allFields(animalParser))
    .mapErr(err => console.log(err));

  // =>
  // { path: '["c"].type', expected: 'string', found: 'undefined' }
}

function exampleTwo() {
  type MyTuple = [string, number, number | undefined];

  // Type annotation needed to appease the TS compiler:
  const parseMyTuple: Parse<MyTuple> = (x: unknown) => array(x)
    .andThen(elements<MyTuple>([stringVal, numberVal, optional(numberVal)]));

  const tuple = parseMyTuple(["hello", 3] as unknown).unwrap();

  console.log(tuple);

  // =>
  // [ 'hello', 3, undefined ]

  // Can be used to destructure and transform:
  interface MyStruct {
    horseName: string,
    horseAge: number,
    carrotQuota: number | undefined,
  }

  const parseMyStruct: Parse<MyStruct> = (x: unknown) =>
    parseMyTuple(x)
      .map(tuple => {
        const [horseName, horseAge, carrotQuota] = tuple;
        return { horseName, horseAge, carrotQuota };
      });

  console.log(parseMyStruct(["Blaze", 13, 4]).unwrap());

  // =>
  // { horseName: 'Blaze', horseAge: 13, carrotQuota: 4 }
}

describe("example one", () => {
  it("executes example one", () => {
    exampleOne();
  })

  it("executes example two", () => {
    exampleTwo();
  })
});
