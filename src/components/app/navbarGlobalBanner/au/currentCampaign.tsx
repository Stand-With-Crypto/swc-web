'use client'

import Link from 'next/link'

import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.AU
const urls = getIntlUrls(countryCode)

export function AuCurrentNavbarGlobalBannerCampaign() {
  const campaignUrl = urls.pitchFest()

  return (
    <Link href={campaignUrl}>
      <CampaignWrapper>
        <p>
          SWC Pitch Fest is live - submit your idea for the chance to win support for your project
        </p>
      </CampaignWrapper>
    </Link>
  )
}
