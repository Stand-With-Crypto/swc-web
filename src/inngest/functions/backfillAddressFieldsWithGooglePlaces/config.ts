export const BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_BATCH_SIZE = 5000
export const BATCH_BUFFER = 1.05
export const BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_RETRY_LIMIT = 5
export const MINI_BATCH_SIZE = 500
/**
 * This is the maximum number of concurrent database updates that can be performed at once.
 * This prevents overwhelming the database connection pool.
 */
export const DATABASE_UPDATE_CONCURRENCY = 20
