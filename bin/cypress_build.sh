#!/usr/bin/env bash

npx prisma generate
npm run codegen
npm run intl:extract-compile
SEED_SIZE=SM npm run db:seed
NODE_OPTIONS="--max-old-space-size=4096" npm run build
