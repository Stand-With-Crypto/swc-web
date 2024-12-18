#!/usr/bin/env bash

set -e
npm run db:check
npx prisma generate
npm run intl:extract-compile
npm run codegen
echo "Running build"
npm run build
wait
echo "frontend assets built"