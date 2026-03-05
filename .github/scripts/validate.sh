#!/usr/bin/env bash
# Optional validation: ensure build output exists. Used by deploy workflow.
set -e
test -f dist/index.html || (echo "Missing dist/index.html" && exit 1)
test -f dist/feed.xml || (echo "Missing dist/feed.xml" && exit 1)
test -f dist/eatcodewrite.css || (echo "Missing dist/eatcodewrite.css" && exit 1)
echo "Validation OK."
