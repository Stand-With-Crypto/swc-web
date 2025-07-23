'use client'

import Link from 'next/link'

import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'
import { getDeeplinkUrlByCampaignName } from '@/components/app/userActionFormEmailCongressperson/getDeeplinkUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

export function AuCurrentNavbarGlobalBannerCampaign() {
  const campaignUrl = getDeeplinkUrlByCampaignName({
    countryCode: SupportedCountryCodes.AU,
    campaignName: AUUserActionEmailCampaignName.WELCOME_MP_BACK_TO_PARLIAMENT_2025,
  })

  return (
    <CampaignWrapper>
      <p>
        <strong>
          <Link href={campaignUrl}>Email Your MP</Link>
        </strong>
        <br className="block sm:hidden" />
        <span className="hidden sm:inline"> – </span>
        <span>Support Blockchain as a Priority for Australia’s Productivity Agenda</span>
      </p>
    </CampaignWrapper>
  )
}
