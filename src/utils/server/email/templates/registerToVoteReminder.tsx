import USRegisterToVoteReminderEmail from '@/utils/server/email/templates/us/registerToVoteReminder'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getRegisterToVoteReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USRegisterToVoteReminderEmail
    case SupportedCountryCodes.CA:
      return null
    case SupportedCountryCodes.AU:
      return null
    case SupportedCountryCodes.GB:
      return null
    default:
      return gracefullyError({
        msg: `No RegisterToVoteReminderEmail template found for countryCode: ${countryCode as string}`,
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

export default getRegisterToVoteReminderEmail
