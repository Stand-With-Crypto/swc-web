import { NFTSlug } from '@/utils/shared/nft'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface UserActionFormClaimNFTProps {
  countryCode: SupportedCountryCodes
  nftSlug: NFTSlug
  onFinished: () => void
  trackMount?: boolean
}
