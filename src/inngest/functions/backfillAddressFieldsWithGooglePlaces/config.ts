export const BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_BATCH_SIZE = 5000
export const BATCH_BUFFER = 1.05
export const BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_RETRY_LIMIT = 5
export const DEFAULT_MINI_BATCH_SIZE = 600
/**
 * This is the maximum number of concurrent "Processor" jobs that can be running at once.
 * This is to prevent the script from overwhelming the database and hitting connection pool limits.
 */
export const CONCURRENCY_LIMIT = 10
