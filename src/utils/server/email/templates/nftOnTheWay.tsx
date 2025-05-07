import AUNFTOnTheWayEmail from '@/utils/server/email/templates/au/nftOnTheWay'
import CANFTOnTheWayEmail from '@/utils/server/email/templates/ca/nftOnTheWay'
import GBNFTOnTheWayEmail from '@/utils/server/email/templates/gb/nftOnTheWay'
import USNFTOnTheWayEmail from '@/utils/server/email/templates/us/nftOnTheWay'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getNFTOnTheWayEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USNFTOnTheWayEmail
    case SupportedCountryCodes.CA:
      return CANFTOnTheWayEmail
    case SupportedCountryCodes.AU:
      return AUNFTOnTheWayEmail
    case SupportedCountryCodes.GB:
      return GBNFTOnTheWayEmail
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
