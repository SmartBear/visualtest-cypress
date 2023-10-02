#!/bin/bash

# Define color codes for LINUX only
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
#YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
#MAGENTA=$(tput setaf 5)
RESET=$(tput sgr0)


scripts/utils/check-npm-updates.sh

echo "${BLUE}Navigating to the 'test' directory...${RESET}"
cd test || exit 1


echo "${BLUE}Running Cypress tests...${RESET}"
#npx cypress run -q -s 'cypress/e2e/test-spec/*'
npx cypress run -q -s 'cypress/e2e/quick*'

cd ..
