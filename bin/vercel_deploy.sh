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

echo "Running build with HTTP tracing enabled..."

# Enable HTTP/HTTPS request tracing during ALL build steps (including db:generate and codegen)
export NODE_OPTIONS="${NODE_OPTIONS} -r ./bin/trace-https"

npm run db:generate
npm run codegen

# Memory tracking functions
get_memory_usage() {
  # Get current memory usage in MB
  node -e "
    const usage = process.memoryUsage();
    const rss = Math.round(usage.rss / 1024 / 1024);
    const heap = Math.round(usage.heapUsed / 1024 / 1024);
    const external = Math.round(usage.external / 1024 / 1024);
    console.log(\`RSS: \${rss}MB, Heap: \${heap}MB, External: \${external}MB, Total: \${rss + external}MB\`);
  "
}

get_system_memory() {
    free -m | awk 'NR==2{printf "System Memory - Used: %sMB, Available: %sMB, Usage: %.1f%%\n", $3, $7, $3*100/($3+$7)}'
}

# Initial memory snapshot
echo ""
echo "📊 INITIAL MEMORY STATE:"
echo "   Process: $(get_memory_usage)"
echo "   $(get_system_memory)"

npm run db:generate
npm run codegen
npm run build -- --experimental-debug-memory-usage

echo ""
echo "📊 FINAL MEMORY STATE:"
echo "   Process: $(get_memory_usage)"
echo "   $(get_system_memory)"

wait
echo "frontend assets built"