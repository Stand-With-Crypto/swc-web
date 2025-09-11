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

# removed temporarily until we have a better way to check the DB schema
# checkDbSchema

npm run db:generate
npm run codegen
echo "Running build with HTTP tracing enabled..."

# Enable HTTP/HTTPS request tracing during build
export NODE_OPTIONS="${NODE_OPTIONS} -r ./bin/trace-https"

# Run build with enhanced logging and memory monitoring
echo "🔍 Starting traced build process..."
echo "📊 Build environment: $NEXT_PUBLIC_ENVIRONMENT"
echo "🧠 Node memory limit: $(node -e "console.log(Math.round(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024))")"MB"
echo "⏰ Build start: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# Use /usr/bin/time to get detailed memory and performance stats
echo "📈 Running build with detailed system metrics..."
/usr/bin/time -l npm run build

wait
echo "⏰ Build end: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "frontend assets built"