import USNFTArrivedEmail from '@/utils/server/email/templates/us/nftArrived'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getNFTArrivedEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USNFTArrivedEmail
    case SupportedCountryCodes.CA:
      return null
    case SupportedCountryCodes.AU:
      return null
    case SupportedCountryCodes.GB:
      return null
    default:
      return gracefullyError({
        msg: `No NFTArrivedEmail template found for countryCode: ${countryCode as string}`,
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

export default getNFTArrivedEmail
