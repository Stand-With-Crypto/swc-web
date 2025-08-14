'use client'

import Link from 'next/link'

import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const urls = getIntlUrls(SupportedCountryCodes.US)

export function UsCurrentNavbarGlobalBannerCampaign() {
  return (
    <CampaignWrapper>
      <p>
        Today is the Crypto Day of Action! Take a moment to make your voice heard{' '}
        <strong>
          <Link href={urls.dayOfActionLP()}>HERE</Link>
        </strong>
      </p>
    </CampaignWrapper>
  )
}
