#!/usr/bin/env bash
CHANGED=$(git diff-index --name-only HEAD --)
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$BRANCH" != "main" ]]; then
     echo "deploy scripts should only be run from the main branch. you are on $BRANCH. Exiting deploy script.";
     exit 1;
elif [[ -n "$CHANGED" ]] ; then
     echo "You have uncommited changes, please commit those to main before deploying. Exiting deploy script."; 
     exit 1;
else
     echo "deploying production web."
fi
git fetch origin
git pull origin main
git checkout deploy-web-production
git reset --hard origin/deploy-web-production
git merge main --no-edit
git push origin deploy-web-production
git checkout main