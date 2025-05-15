import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const SENDGRID_CONTACTS_API_LIMIT = 30000
export const SIX_MB_IN_BYTES = 6 * 1024 * 1024
export const SENDGRID_CONTACTS_API_LIMIT_BYTES = 3600000 // Approx 3.44MiB, server limit is 4MiB (4,194,304 bytes)
export const DB_READ_LIMIT = 100000

/**
 * Skipping US
 */
export const COUNTRIES_TO_SYNC = [
  SupportedCountryCodes.GB,
  SupportedCountryCodes.CA,
  SupportedCountryCodes.AU,
]
