#!/usr/bin/env bash

npm run db:generate
npm run codegen
COUNTRIES_TO_UPDATE=us npm run db:seed-swc-civic
SEED_SIZE=SM npm run db:seed
NODE_OPTIONS="--max-old-space-size=6144" npm run build
