#!/usr/bin/env bash

set -e

# Function to check the DB schema if the environment is production
checkDbSchema() {
  if [[ "$NEXT_PUBLIC_ENVIRONMENT" == "production" ]]; then
    echo "Running db:check to check for differences in the schema..."
    
    if ! npm run db:check; then
      echo "Error: Database schema check failed!"
      exit 1
    fi
    
    echo "Database schema check completed successfully."
  else
    echo "Skipping db:check because NEXT_PUBLIC_ENVIRONMENT is not production."
    echo "Environment: $NEXT_PUBLIC_ENVIRONMENT"
  fi
}

checkDbSchema

npx prisma generate
npm run codegen
echo "Running build"
npm run build
wait
echo "frontend assets built"