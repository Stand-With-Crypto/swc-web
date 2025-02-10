#!/usr/bin/env bash

npm run lint:cypress
npx prisma generate
npm run codegen
SEED_SIZE=SM npm run db:seed
NODE_OPTIONS="--max-old-space-size=6144" npm run build
