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
    if git diff --name-only HEAD^ HEAD | grep -q 'prisma/schema.prisma'; then
        echo "Schema changes detected on a main branch, pushing changes to db. If there are breaking changes this command will fail"
        npx prisma db push --skip-generate
        echo "Building app"
    else
        echo "No schema changes, building app"
    fi
    npm run build
    wait
    echo "frontend assets built"
else
    if git diff --name-only HEAD^ HEAD | grep -q 'prisma/schema.prisma'; then
        echo "Schema changes detected on a preview branch, skipping deploy because this branch is pointing at the testing db which does not have the schema changes. The failure below is expected and is not an issue."
        exit 0;
        exit 1;
        echo "should not get called";
    fi
    echo "No schema changes, building app"
    npm run build
    wait
    echo "frontend assets built"
fi
