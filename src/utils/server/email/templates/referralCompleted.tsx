import AUReferralCompletedEmail from '@/utils/server/email/templates/au/referralCompleted'
import CAReferralCompletedEmail from '@/utils/server/email/templates/ca/referralCompleted'
import GBReferralCompletedEmail from '@/utils/server/email/templates/gb/referralCompleted'
import USReferralCompletedEmail from '@/utils/server/email/templates/us/referralCompleted'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getReferralCompletedEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USReferralCompletedEmail
    case SupportedCountryCodes.CA:
      return CAReferralCompletedEmail
    case SupportedCountryCodes.AU:
      return AUReferralCompletedEmail
    case SupportedCountryCodes.GB:
      return GBReferralCompletedEmail
    default:
      return gracefullyError({
        msg: `No ReferralCompletedEmail template found for countryCode: ${countryCode as string}`,
        fallback: null,
        hint: {
          tags: {
            domain: 'email',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}

export default getReferralCompletedEmail
