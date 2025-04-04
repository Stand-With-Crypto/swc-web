import { NavBarGlobalBanner } from 'src/components/app/navbarGlobalBanner/common/bannerComponent'

import { UsCurrentNavbarGlobalBannerCampaign } from '@/components/app/navbarGlobalBanner/us/currentCampaign'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.US

export function UsNavbarGlobalBanner() {
  return (
    <NavBarGlobalBanner
      countryCode={countryCode}
      currentCampaignComponent={<UsCurrentNavbarGlobalBannerCampaign />}
    />
  )
}
