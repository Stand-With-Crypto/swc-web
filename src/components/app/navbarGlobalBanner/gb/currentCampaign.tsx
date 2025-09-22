import Link from 'next/link'

import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'

export function GbCurrentNavbarGlobalBannerCampaign() {
  return (
    <CampaignWrapper>
      <p>
        URGENT:{' '}
        <strong>
          <Link href="https://petition.parliament.uk/petitions/730568" target="_blank">
            Sign Petition
          </Link>
        </strong>{' '}
        to drive Stablecoin Leadership in the UK
      </p>
    </CampaignWrapper>
  )
}
