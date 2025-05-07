import AUNFTArrivedEmail from '@/utils/server/email/templates/au/nftArrived'
import CANFTArrivedEmail from '@/utils/server/email/templates/ca/nftArrived'
import GBNFTArrivedEmail from '@/utils/server/email/templates/gb/nftArrived'
import USNFTArrivedEmail from '@/utils/server/email/templates/us/nftArrived'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getNFTArrivedEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USNFTArrivedEmail
    case SupportedCountryCodes.CA:
      return CANFTArrivedEmail
    case SupportedCountryCodes.AU:
      return AUNFTArrivedEmail
    case SupportedCountryCodes.GB:
      return GBNFTArrivedEmail
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
