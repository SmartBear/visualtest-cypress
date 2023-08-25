#!/bin/bash

# Define color codes for LINUX only
RED=$(tput setaf 1)
#GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
#MAGENTA=$(tput setaf 5)
RESET=$(tput sgr0)
#UNDERLINE=$(tput smul)
#NO_UNDERLINE=$(tput rmul)

current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "${BLUE}On branch:${RESET} $current_branch"
if [ "$current_branch" != "main" ]; then
  read -r -p "It's recommended to ${YELLOW}publish only from the main branch.${RESET} Do you want to override? (y): "  override
  if [ "$override" != "y" ] && [ "$override" != "Y" ]; then
    echo "${RED}Aborted.${RESET}"
    exit 1
  fi
fi

if [ "$current_branch" == "main" ]; then
    echo "${BLUE}Pulling the latest changes...${RESET}"
    git pull
    if [ $? -ne 0 ]; then
        echo "${RED}Error pulling latest changes. Aborting.${RESET}"
        exit 1
    fi
fi

