import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const SENDGRID_CONTACTS_API_LIMIT = 30000
export const SENDGRID_CONTACTS_API_LIMIT_BYTES = 3900000 // Approx 3.72MiB, server limit is 4MiB (4,194,304 bytes)
export const SENDGRID_API_RATE_LIMIT = 5
export const DB_READ_LIMIT = 40000

/**
 * Skipping US
 */
export const COUNTRIES_TO_SYNC = [
  SupportedCountryCodes.GB,
  SupportedCountryCodes.CA,
  SupportedCountryCodes.AU,
]
