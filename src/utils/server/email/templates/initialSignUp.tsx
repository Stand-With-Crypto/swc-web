import AUInitialSignUpEmail from '@/utils/server/email/templates/au/initialSignUp'
import CAInitialSignUpEmail from '@/utils/server/email/templates/ca/initialSignUp'
import GBInitialSignUpEmail from '@/utils/server/email/templates/gb/initialSignUp'
import USInitialSignUpEmail from '@/utils/server/email/templates/us/initialSignUp'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getInitialSignUpEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USInitialSignUpEmail
    case SupportedCountryCodes.CA:
      return CAInitialSignUpEmail
    case SupportedCountryCodes.AU:
      return AUInitialSignUpEmail
    case SupportedCountryCodes.GB:
      return GBInitialSignUpEmail
    default:
      return gracefullyError({
        msg: `No InitialSignUpEmail template found for countryCode: ${countryCode as string}`,
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

export default getInitialSignUpEmail
