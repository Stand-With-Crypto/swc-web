#!/usr/bin/env bash

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
bold=$(tput bold)
normal=$(tput sgr0)

if [[ "$BRANCH" == "main" ]]; then
  echo "setup preview script should only be run from feature branches. you are on $BRANCH. Exiting...";
  exit 1;
fi

if ! command -v vercel &> /dev/null
then
  echo "vercel cli could not be found. Exiting...";
  exit 1;
fi

echo "Removing Environment Variable ${bold}DATABASE_URL${normal} from ${bold}$BRANCH${normal}."

vercel env rm DATABASE_URL preview $BRANCH --yes
