#!/usr/bin/env bash
npm run test && \
  ./test-failures.sh && \
  npm run build && \
  echo "OK for release, publish from dist"
