#!/bin/bash

# the file stops if a non-zero exit
set -e

scripts/utils/check-npm-updates.sh

# mainly for the package locks to be consistent
npm i
cd test || exit 1
npm i
cd ..


scripts/utils/github-branch-check.sh

#scripts/build.sh

scripts/utils/npm-or-github-publish.sh npm
