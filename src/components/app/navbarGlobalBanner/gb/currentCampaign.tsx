import Link from 'next/link'

import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'

export function GbCurrentNavbarGlobalBannerCampaign() {
  return (
    <CampaignWrapper>
      <p>
        Today is the Crypto Day of Action! Take a moment to make your voice heard{' '}
        <strong>
          <Link href="https://petition.parliament.uk/petitions/730568" target="_blank">
            HERE
          </Link>
        </strong>
      </p>
    </CampaignWrapper>
  )
}
