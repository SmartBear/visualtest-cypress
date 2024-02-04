#!/bin/bash

# Define color codes for LINUX only
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
RESET=$(tput sgr0)

npm i

# Check for package updates, excluding chalk
echo "${BLUE}Checking for package updates (excluding chalk)${RESET}..."

# Save the output to a variable
output=$(npx npm-check-updates --reject chalk)

# Print the output
echo "$output"

# Check if there are no updates available
if echo "$output" | grep -q "All dependencies match the latest package versions"; then
  echo "${GREEN}No updates available. Exiting.${RESET}"
  exit 0
fi

# Prompt user for next steps
echo -e "\nWhat would you like to do next?"
echo "  1) ${GREEN}Update all packages${RESET}"
echo "  2) ${BLUE}Interactive mode to selectively update packages${RESET}"
echo "  3) ${YELLOW}Skip updating${RESET}"

read -r -p "Enter your choice (1/2/3): " choice

# Perform the chosen action
case $choice in
    1)
        echo "${GREEN}Updating all packages...${RESET}"
        npx npm-check-updates --reject chalk -u
        npm install
        exit 0
        ;;
    2)
        echo "${BLUE}Entering interactive mode...${RESET}"
        npx npm-check-updates --reject chalk -i
        exit 0
        ;;
    3)
        echo "${YELLOW}Skipping updates.${RESET}"
        exit 0
        ;;
    *)
        echo "${RED}Invalid choice. Exiting.${RESET}"
        exit 1
        ;;
esac
