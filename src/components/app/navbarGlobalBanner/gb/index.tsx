import { NavBarGlobalBanner } from 'src/components/app/navbarGlobalBanner/common/bannerComponent'

import { GbCurrentNavbarGlobalBannerCampaign } from '@/components/app/navbarGlobalBanner/gb/currentCampaign'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.GB

export function GbNavbarGlobalBanner() {
  return (
    <NavBarGlobalBanner
      countryCode={countryCode}
      currentCampaignComponent={<GbCurrentNavbarGlobalBannerCampaign />}
    />
  )
}
