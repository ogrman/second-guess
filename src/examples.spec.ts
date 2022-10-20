import { Err, Ok, Result } from 'ts-results';
import {
  allElements,
  allKeys,
  array,
  booleanVal,
  extractKeys,
  numberVal,
  object,
  optional,
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
    .andThen(obj => extractKeys({
      type: x => stringVal(x)
        .andThen(x => {
          if (x === "horse" || x === "duck") {
            return new Ok(x as "horse" | "duck");
          } else {
            return new Err({
              expected: "horse or duck",
              found: JSON.stringify(x),
              path: "",
            })
          }
        }),
      name: stringVal,
      age: numberVal,
      licensedToKill: booleanVal,
      nickname: optional(stringVal),
    })(obj));
  
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
    .andThen(array => allElements(animalParser)(array))
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
    .andThen(object => allKeys(animalParser)(object))
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
    .andThen(object => allKeys(animalParser)(object))
    .mapErr(err => console.log(err));

  // =>
  // { path: '["c"].type', expected: 'string', found: 'undefined' }
}

describe("example one", () => {
  it("executes example one", () => {
    exampleOne();
  })
})