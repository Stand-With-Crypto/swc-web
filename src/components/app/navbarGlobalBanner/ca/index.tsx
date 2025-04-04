import { NavBarGlobalBanner } from 'src/components/app/navbarGlobalBanner/common/bannerComponent'

import { CaCurrentNavbarGlobalBannerCampaign } from '@/components/app/navbarGlobalBanner/ca/currentCampaign'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.CA

export function CaNavbarGlobalBanner() {
  return (
    <NavBarGlobalBanner
      countryCode={countryCode}
      currentCampaignComponent={<CaCurrentNavbarGlobalBannerCampaign />}
    />
  )
}
