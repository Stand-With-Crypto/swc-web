import USNFTOnTheWayEmail from '@/utils/server/email/templates/us/nftOnTheWay'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getNFTOnTheWayEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USNFTOnTheWayEmail
    case SupportedCountryCodes.CA:
      return null
    case SupportedCountryCodes.AU:
      return null
    case SupportedCountryCodes.GB:
      return null
    default:
      return gracefullyError({
        msg: `No NFTOnTheWayEmail template found for countryCode: ${countryCode as string}`,
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

export default getNFTOnTheWayEmail
