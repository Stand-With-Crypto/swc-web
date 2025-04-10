import { NavBarGlobalBanner } from 'src/components/app/navbarGlobalBanner/common/bannerComponent'

import { AuCurrentNavbarGlobalBannerCampaign } from '@/components/app/navbarGlobalBanner/au/currentCampaign'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.AU

export function AuNavbarGlobalBanner() {
  return (
    <NavBarGlobalBanner
      countryCode={countryCode}
      currentCampaignComponent={<AuCurrentNavbarGlobalBannerCampaign />}
    />
  )
}
