#!/usr/bin/env bash

echo "Checking if README.md has been updated..."

# This is needed to work around a strange behaviour in git diff-index, where a
# file that has a different modification time but the same content shows up as
# modified until git diff is run once.
git diff > /dev/null

if ! git diff-index --quiet HEAD -- README.md; then
    echo "README.md needs to be regenerated!"
    echo
    echo "Please run:"
    echo "  $ npm run docs"
    exit 1
fi

exit 0
