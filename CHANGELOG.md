# 0.2.3

- Updated examples

# 0.2.2

- Add the chain parser to chain two parsers together, the second accepting
  the output from the first

# 0.2.1

- Update example to use better parser combination from version 2.0.0
- Update `member` function so that it returns a parser instead of performing
  the parsing
- Add CHANGELOG.md

# 0.2.0

- Add input type for `Parse` type
- No parsers accept the data to parse as an argument, instead returns a
  function which performs the operation
