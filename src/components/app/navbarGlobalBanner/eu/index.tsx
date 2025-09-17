import { NavBarGlobalBanner } from 'src/components/app/navbarGlobalBanner/common/bannerComponent'

import { EuCurrentNavbarGlobalBannerCampaign } from '@/components/app/navbarGlobalBanner/eu/currentCampaign'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.EU

export function EuNavbarGlobalBanner() {
  return (
    <NavBarGlobalBanner
      countryCode={countryCode}
      currentCampaignComponent={<EuCurrentNavbarGlobalBannerCampaign />}
    />
  )
}
