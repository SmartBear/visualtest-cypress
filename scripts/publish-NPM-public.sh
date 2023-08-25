#!/bin/bash

# the file stops if a non-zero exit
set -e

scripts/utils/github-branch-check.sh

#scripts/build.sh

scripts/utils/npm-or-github-publish.sh npm
