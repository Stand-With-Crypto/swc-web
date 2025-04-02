import AUFollowOnXReminderEmail from '@/utils/server/email/templates/au/followOnXReminder'
import CAFollowOnXReminderEmail from '@/utils/server/email/templates/ca/followOnXReminder'
import GBFollowOnXReminderEmail from '@/utils/server/email/templates/gb/followOnXReminder'
import USFollowOnXReminderEmail from '@/utils/server/email/templates/us/followOnXReminder'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getFollowOnXReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USFollowOnXReminderEmail
    case SupportedCountryCodes.CA:
      return CAFollowOnXReminderEmail
    case SupportedCountryCodes.AU:
      return AUFollowOnXReminderEmail
    case SupportedCountryCodes.GB:
      return GBFollowOnXReminderEmail
    default:
      return gracefullyError({
        msg: `No FollowOnXReminderEmail template found for countryCode: ${countryCode as string}`,
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

export default getFollowOnXReminderEmail
