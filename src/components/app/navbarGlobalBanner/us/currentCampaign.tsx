import Link from 'next/link'

import { CampaignWrapper } from '@/components/app/navbarGlobalBanner/common/campaignWrapper'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.US
const urls = getIntlUrls(countryCode)

export function UsCurrentNavbarGlobalBannerCampaign() {
  const campaignUrl = urls.usdcRewardsSep2025()

  return (
    <CampaignWrapper>
      <p>
        Big Banks are coming after your crypto rewards - Tell Your Senator No - Click{' '}
        <strong>
          <Link href={campaignUrl}>here</Link>
        </strong>{' '}
      </p>
    </CampaignWrapper>
  )
}
