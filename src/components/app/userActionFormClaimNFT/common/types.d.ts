import { NFTSlug } from '@/utils/shared/nft'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { USUserActionClaimNftCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export interface UserActionFormClaimNFTProps {
  countryCode: SupportedCountryCodes
  nftSlug: NFTSlug
  campaignName?: USUserActionClaimNftCampaignName
  onFinished: () => void
  trackMount?: boolean
}
