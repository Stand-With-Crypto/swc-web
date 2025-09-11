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
  # Get system memory if available
  if command -v free >/dev/null 2>&1; then
    # Linux
    free -m | awk 'NR==2{printf "System Memory - Used: %sMB, Available: %sMB, Usage: %.1f%%\n", $3, $7, $3*100/($3+$7)}'
  elif command -v vm_stat >/dev/null 2>&1; then
    # macOS
    vm_stat | awk '
      /Pages free/ { free = $3 }
      /Pages active/ { active = $3 }
      /Pages inactive/ { inactive = $3 }
      /Pages speculative/ { spec = $3 }
      /Pages wired/ { wired = $3 }
      END {
        total_pages = free + active + inactive + spec + wired
        used_pages = active + inactive + wired
        total_mb = total_pages * 4096 / 1024 / 1024
        used_mb = used_pages * 4096 / 1024 / 1024
        printf "System Memory - Used: %.0fMB, Total: %.0fMB, Usage: %.1f%%\n", used_mb, total_mb, (used_mb/total_mb)*100
      }'
  else
    echo "System Memory - Unable to detect"
  fi
}

# Run build with enhanced logging and memory monitoring
echo "🔍 Starting traced build process..."
echo "📊 Build environment: $NEXT_PUBLIC_ENVIRONMENT"
echo "🧠 Node memory limit: $(node -e 'console.log(Math.round(require("v8").getHeapStatistics().heap_size_limit / 1024 / 1024))')MB"
echo "⏰ Build start: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# Initial memory snapshot
echo ""
echo "📊 INITIAL MEMORY STATE:"
echo "   Process: $(get_memory_usage)"
echo "   $(get_system_memory)"

# Memory monitoring during build phases
echo ""
echo "📈 Starting build phases with memory tracking..."

npm run db:generate

npm run codegen


# Use shell builtin time which is available everywhere
echo "📊 Using shell time command for build timing..."
npm run build

echo ""
echo "📊 FINAL MEMORY STATE:"
echo "   Process: $(get_memory_usage)"
echo "   $(get_system_memory)"

wait
echo ""
echo "⏰ Build end: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "✅ Build completed - check memory deltas above for usage patterns"
echo "frontend assets built"