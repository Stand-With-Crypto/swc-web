#!/usr/bin/env bash

printenv

set -e
npx prisma generate
npm run intl:extract-compile
npm run codegen
echo "Running build"
npm run build
wait
echo "frontend assets built"
