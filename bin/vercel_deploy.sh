#!/usr/bin/env bash

set -e
npx prisma generate
npm run intl:extract-compile
npm run codegen
# TODO determine if we want to run lint and test when merging to master and when deploying to production
# The pros: nothing wrong with an extra sanity check
# The cons: it takes a while to run and can slow down the deployment process, especially if we need to urgently make changes
# Proposal: once we have a team working on this codebase, protect the main branch so people can't merge directly, and run lint/test on PRs, but not on master and production deployments
npm run lint
NODE_ENV=test npm run test
# If the branch is a db changes branch, we're going to skip building the preview because it's pointing to a database without the changes (testing)
if [[ $VERCEL_GIT_COMMIT_REF == "main" || $VERCEL_GIT_COMMIT_REF == "deploy-web-production" ]]; then
    echo "pushing database changes"
    npx prisma db push --skip-generate
else
    echo "Skip pushing database changes on preview branches to prevent accidently overridding the testing db schema with branch changes before they're ready to merge. You should be running npx prisma db push against your developer branch as needed locally."
fi
echo "Running build"
npm run build
wait
echo "frontend assets built"
