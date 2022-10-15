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

You wish.

## Attribution

This library uses [ts-results](https://github.com/vultix/ts-results/) to get
Rust-like result types. I also lifted the Typescript configuration and
packaging from there since I have no idea on how to package NPM packages.
