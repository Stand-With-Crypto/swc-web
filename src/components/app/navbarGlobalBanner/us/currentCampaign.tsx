'use client'
import Link from 'next/link'

import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'
import { getDeeplinkUrlByCampaignName } from '@/components/app/userActionFormEmailCongressperson/getDeeplinkUrl'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export function UsCurrentNavbarGlobalBannerCampaign() {
  const campaignUrl = getDeeplinkUrlByCampaignName(
    USUserActionEmailCampaignName.GENIUS_ACT_MAY_13_2025,
  )

  return (
    <CampaignWrapper url={campaignUrl}>
      <p>
        Key Vote Alert – Cloture on the GENIUS Act
        <br className="block sm:hidden" />
        <span className="hidden sm:inline"> – </span>
        <strong>
          <Link href={campaignUrl}>Email your Senators now</Link>
        </strong>
      </p>
    </CampaignWrapper>
  )
}
