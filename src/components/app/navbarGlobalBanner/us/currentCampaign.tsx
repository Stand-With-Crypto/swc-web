'use client'

import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getUserActionDeeplink } from '@/utils/shared/urlsDeeplinkUserActions'

export function UsCurrentNavbarGlobalBannerCampaign() {
  const campaignUrl = getUserActionDeeplink({
    actionType: UserActionType.CLAIM_NFT,
    config: {
      countryCode: SupportedCountryCodes.US,
    },
  })

  return (
    <CampaignWrapper>
      <p>
        Historic Crypto Wins! U.S. House Passes CLARITY and GENIUS Acts
        <span> – </span>
        <strong>
          <Link href={campaignUrl}>Claim your commemorative NFT!</Link>
        </strong>
      </p>
    </CampaignWrapper>
  )
}
