#!/usr/bin/env bash

set -e

# Function to check the DB schema if the environment is production
checkDbSchema() {
  if [ "$NEXT_PUBLIC_ENVIRONMENT" = "production" ]; then
    echo "Running db:check to check for differences in the schema."
    
    npm run db:check
  else
    echo "Skipping db:check because NEXT_PUBLIC_ENVIRONMENT is not production."
  fi
}

checkDbSchema

npx prisma generate
npm run intl:extract-compile
npm run codegen
echo "Running build"
npm run build
wait
echo "frontend assets built"