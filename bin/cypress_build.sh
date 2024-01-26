#!/usr/bin/env bash

npx prisma generate
npm run codegen
npm run intl:extract-compile
npm run db:seed
npm run build
