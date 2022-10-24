#!/usr/bin/env bash
for failure in ./failures/*.ts; do
  echo "$failure compiling...";

  npx --no-install tsc --noEmit --strict $failure > /dev/null;

  if [ $? -eq 0 ] ; then
    echo "$failure compiled, but it should not";
    exit 1;
  else
    echo "$failure ok";
  fi
done
