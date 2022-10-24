# second-guess

Having trust issues when loading JSON data? Why don't you parse it?

Just because you think your backend isn't out to get you does not in any way
shape or form mean it isn't.

This is not a JSON parser. It parses parsed JSON. First call `JSON.parse`,
then invoke your parser on the result.

## Why I made this

In 2014 I wrote a game that loads huge JSON data files. Many of these files
contained subtle bugs or incorrect structure, and when converting the game to
TypeScript I didn't want to handle it by just casting all of these documents
to the preferred time.

# Installation

```
npm install second-guess
```

## Examples

Parsing a simple structure with an optional field:

```javascript
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
```

Parsing and transforming a tuple:

```javascript
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
```

## Attribution

This library uses [ts-results](https://github.com/vultix/ts-results/) to get
Rust-like result types. I also lifted the Typescript configuration and
packaging from there since I have no idea on how to package NPM packages.
