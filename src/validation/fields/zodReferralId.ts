import { z } from 'zod'

export const zodReferralId = z
  .string()
  // Zod's nanoid does not allows to specify a custom length for the id
  .length(12, 'Referral ID must be exactly 12 characters long')
  .regex(/^[A-Za-z0-9_-]+$/, 'Referral ID contains invalid characters')
