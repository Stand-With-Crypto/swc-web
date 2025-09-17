#!/usr/bin/env bash

set -e

# Parse command line arguments
DEBUG_MEMORY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --debug-memory)
      DEBUG_MEMORY=true
      shift
      ;;
    *)
      echo "Unknown parameter: $1"
      echo "Usage: $0 [--debug-memory]"
      exit 1
      ;;
  esac
done

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

# removed temporarily until we have a better way to check the DB schema
# checkDbSchema

npm run db:generate
npm run codegen
echo "Running build"
if [[ "$DEBUG_MEMORY" == "true" ]]; then
  echo "Running build with memory debugging enabled"
  npm run build -- --experimental-debug-memory-usage
else
  npm run build
fi
wait
echo "frontend assets built"