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
npm run build
wait
echo "frontend assets built"