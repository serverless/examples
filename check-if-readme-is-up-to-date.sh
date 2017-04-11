#!/usr/bin/env bash

echo "Checking if README.md has been updated..."

git update-index --refresh

if ! git diff-index --quiet HEAD -- README.md; then
    echo "README.md needs to be regenerated!"
    echo
    echo "Please run:"
    echo "  $ npm run docs"
    exit 1
fi

exit 0
