'use client'

import Link from 'next/link'

import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'
import { getDeeplinkUrlByCampaignName } from '@/components/app/userActionFormEmailCongressperson/getDeeplinkUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export function UsCurrentNavbarGlobalBannerCampaign() {
  const campaignUrl = getDeeplinkUrlByCampaignName({
    countryCode: SupportedCountryCodes.US,
    campaignName: USUserActionEmailCampaignName.CLARITY_ACT_HOUSE_JUN_13_2025,
  })

  return (
    <CampaignWrapper url={campaignUrl}>
      <p>
        Key Vote Alert – Floor Vote on the CLARITY ACT
        <br className="block sm:hidden" />
        <span className="hidden sm:inline"> – </span>
        <strong>
          <Link href={campaignUrl}>Email your House Member now</Link>
        </strong>
      </p>
    </CampaignWrapper>
  )
}
