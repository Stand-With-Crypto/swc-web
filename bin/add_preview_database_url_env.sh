#!/usr/bin/env bash

BRANCH="$(git branch --show-current)"
DATABASE_URL=$(cat .env | grep -e "^DATABASE_URL=" | tail -1 | sed -e "s/^DATABASE_URL=//g" | tr -d '\n' | tr -d '"' | tr -d "'")
bold=$(tput bold)
normal=$(tput sgr0)

if [[ "$BRANCH" == "main" ]]; then
  echo "setup preview script should only be run from feature branches. you are on $BRANCH. Exiting...";
  exit 1;
fi

if [[ "$DATABASE_URL" == "" ]]; then
  echo "${bold}DATABASE_URL${normal} not found in ${bold}.env${normal}. Exiting...";
  exit 1;
fi

if ! command -v vercel &> /dev/null
then
  echo "vercel cli could not be found. Exiting...";
  exit 1;
fi

echo "setting up ${bold}DATABASE_URL${normal} env for ${bold}$BRANCH${normal} preview with the value ${bold}$DATABASE_URL${normal}."

echo "$DATABASE_URL" | vercel env add DATABASE_URL preview $BRANCH
