import { z } from 'zod'

import { zodReferralId } from '@/validation/fields/zodReferrald'

const referralSchema = z.object({
  utm_source: z.literal('swc'),
  utm_medium: z.string().includes('referral'),
  utm_campaign: zodReferralId,
})

export type ReferralUTMParams = z.infer<typeof referralSchema>

export function isValidReferral(params: ReferralUTMParams | undefined): boolean {
  if (!params) return false
  return referralSchema.safeParse(params).success
}
