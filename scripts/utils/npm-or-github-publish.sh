#!/bin/bash

# Define color codes for LINUX only
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
MAGENTA=$(tput setaf 5)
RESET=$(tput sgr0)
UNDERLINE=$(tput smul)
NO_UNDERLINE=$(tput rmul)

# check to make sure a valid options is passed through
NPMRC_PATH="$HOME/.npmrc"
case "$1" in
  npm)
    ;;
  github)
    ;;
  *)
    echo "${YELLOW}Invalid argument.${RESET} Please use either ${MAGENTA}'npm'${RESET} or ${MAGENTA}'github'${RESET} as an argument.${RESET}"
    exit 1
    ;;
esac


# check .npmrc file depending on if npm or github && check user passed a good arguement
case "$1" in
  npm)
    if grep -q "registry=" "$NPMRC_PATH"; then
        echo "${RED}.npmrc file contains a registry! Please log out of the scoped user.${RESET}"
        exit 1
    fi
    ;;
  github)
    if grep -q "@smartbear:registry=" "$NPMRC_PATH"; then
        echo "${GREEN}.npmrc contains the scoped user. Safe to proceed with GitHub.${RESET}"
    else
        echo "${RED}.npmrc file does not contain the scoped user! Please log in to the scoped user.${RESET}"
        exit 1
    fi
    ;;
esac


# grab the latest published version
case "$1" in
  npm)
    latest_published_version=$(npm view @smartbear/visualtest-cypress dist-tags.latest)
    ;;
  github)
    latest_published_version=$(npm view @smartbear/visualtest-cypress --scope=@smartbear --registry=https://npm.pkg.github.comutils/ dist-tags.latest)
    ;;
esac
echo -e "\nLatest ${UNDERLINE}published${NO_UNDERLINE} version is: ${MAGENTA}${latest_published_version}${RESET} on $1"

# Ask user for confirmation
version=$(node -p "require('./package.json').version")
 echo -e "The ${UNDERLINE}local${NO_UNDERLINE} version is: \t     ${MAGENTA}$version${RESET}\n"
 read -r -p "...is this the correct? (y): " answer
if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
  echo "${RED}Aborted.${RESET}"
  exit 1
fi



case "$1" in
  npm)
      read -r -p "${YELLOW}Are you ready to publish to the ${RED}public NPM${RESET}${YELLOW}?${RESET} (type '${UNDERLINE}yes${NO_UNDERLINE}'): " confirm_publish
      if [ "$confirm_publish" == "yes" ] || [ "$confirm_publish" == "YES" ]; then
          echo "${RED}WARNING: 10 second timeout to second guess yourself!${RESET}"
          sleep 10
          echo -n "${BLUE}Publishing to public NPM package...${RESET}"
          npm publish --access public
          echo "${GREEN}Publishing to public NPM package complete${RESET}"
          exit 0
      else
        echo "${RED}Publishing aborted.${RESET}"
          exit 1
      fi
    ;;
  github)
    read -r -p "Are you ready to publish to the ${GREEN}internal GitHub package${RESET}? (y): " confirm_publish
    if [ "$confirm_publish" == "y" ] || [ "$confirm_publish" == "Y" ]; then
        echo "${GREEN}WARNING: 10 second timeout to second guess yourself! Going to internal package anyways!${RESET}"
        sleep 10
        echo "${BLUE}Publishing to internal GitHub package...${RESET}"
        npm publish --access public --scope=@smartbear --registry=https://npm.pkg.github.com
        echo "${GREEN}Publishing to internal GitHub package complete${RESET}"
        exit 0
    else
      echo "${RED}Publishing aborted.${RESET}"
        exit 1
    fi
    ;;
esac
