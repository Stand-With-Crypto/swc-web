export const BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE = 5000
export const BATCH_BUFFER = 1.05
export const BACKFILL_ADDRESS_ELECTORAL_ZONE_RETRY_LIMIT = 5
export const MINI_BATCH_SIZE = 100
/**
 * This is the maximum number of concurrent "Processor" jobs that can be running at once.
 * This is to prevent the script from overwhelming the database and hitting connection pool limits.
 */
export const CONCURRENCY_LIMIT = 10
export const SUB_BATCH_SIZE = 10
export const SLEEP_DURATION = 2000
