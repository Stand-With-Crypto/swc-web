#!/usr/bin/env bash

set -e
npx prisma generate
npm run codegen
echo "Running build"
npm run build
wait
echo "frontend assets built"
