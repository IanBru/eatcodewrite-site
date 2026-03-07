#!/usr/bin/env bash
# Optional validation: ensure build output exists. Used by deploy workflow.
set -e
test -f dist/index.html || (echo "Missing dist/index.html" && exit 1)
test -f dist/feed-code.xml || (echo "Missing dist/feed-code.xml" && exit 1)
test -f dist/feed-recipes.xml || (echo "Missing dist/feed-recipes.xml" && exit 1)
test -f dist/feed-all.xml || (echo "Missing dist/feed-all.xml" && exit 1)
test -f dist/eatcodewrite.css || (echo "Missing dist/eatcodewrite.css" && exit 1)
echo "Validation OK."
