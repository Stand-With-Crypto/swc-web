#!/usr/bin/env bash

set -e
npx prisma generate
npm run intl:extract-compile
npm run codegen
npm run build
wait
echo "frontend assets built"