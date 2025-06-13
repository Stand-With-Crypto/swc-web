'use client'
import Link from 'next/link'

import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export function UsCurrentNavbarGlobalBannerCampaign() {
  const campaignUrl = getIntlUrls(DEFAULT_SUPPORTED_COUNTRY_CODE).emailDeeplink()

  return (
    <CampaignWrapper url={campaignUrl}>
      <p>
        Key Vote Alert – Final Passage on the GENIUS Act
        <br className="block sm:hidden" />
        <span className="hidden sm:inline"> – </span>
        <strong>
          <Link href={campaignUrl}>Email your Senators now</Link>
        </strong>
      </p>
    </CampaignWrapper>
  )
}
