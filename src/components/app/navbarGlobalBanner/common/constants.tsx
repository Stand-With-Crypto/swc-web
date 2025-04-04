import { ReactNode } from 'react'

import { AuNavbarGlobalBanner } from '@/components/app/navbarGlobalBanner/au'
import { CaNavbarGlobalBanner } from '@/components/app/navbarGlobalBanner/ca'
import { GbNavbarGlobalBanner } from '@/components/app/navbarGlobalBanner/gb'
import { UsNavbarGlobalBanner } from '@/components/app/navbarGlobalBanner/us'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const GLOBAL_NAVBAR_BANNER_BY_COUNTRY_CODE: Record<SupportedCountryCodes, ReactNode> = {
  [SupportedCountryCodes.US]: <UsNavbarGlobalBanner />,
  [SupportedCountryCodes.AU]: <AuNavbarGlobalBanner />,
  [SupportedCountryCodes.GB]: <GbNavbarGlobalBanner />,
  [SupportedCountryCodes.CA]: <CaNavbarGlobalBanner />,
}
