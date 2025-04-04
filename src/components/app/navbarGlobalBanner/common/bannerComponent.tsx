'use client'

import { ReactNode } from 'react'
import Cookies from 'js-cookie'

import { RedirectBannerContent } from '@/components/app/navbarGlobalBanner/common/redirectbannerContent'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  COUNTRY_CODE_TO_DISPLAY_NAME,
  COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX,
} from '@/utils/shared/intl/displayNames'
import {
  COUNTRY_CODE_REGEX_PATTERN,
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

export function NavBarGlobalBanner({
  countryCode: currentPageCountryCode,
  currentCampaignComponent,
}: {
  countryCode: SupportedCountryCodes
  currentCampaignComponent: ReactNode
}) {
  const isMobile = useIsMobile()
  const hasHydrated = useHasHydrated()

  const WrapperContainer = isMobile ? 'button' : 'div'

  const userAccessLocation = Cookies.get(USER_ACCESS_LOCATION_COOKIE_NAME)?.toLowerCase()
  const isUserAccessLocationSupported = userAccessLocation
    ? COUNTRY_CODE_REGEX_PATTERN.test(userAccessLocation)
    : false
  const isUserAccessLocationEqualCurrentPageCountryCode =
    userAccessLocation === currentPageCountryCode

  if (!hasHydrated) {
    return currentCampaignComponent
  }

  if (isUserAccessLocationEqualCurrentPageCountryCode) {
    return currentCampaignComponent
  }

  if (userAccessLocation && isUserAccessLocationSupported) {
    return <RedirectBannerContent countryCode={userAccessLocation as SupportedCountryCodes} />
  }

  return (
    <div className="flex h-12 w-full items-center justify-center bg-primary-cta">
      <WrapperContainer className="flex h-12 w-full items-center bg-primary-cta text-center">
        <div className="container flex justify-between">
          <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center max-[330px]:text-xs sm:text-base">
            <p>
              Actions on Stand With Crypto
              {currentPageCountryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE
                ? ` ${COUNTRY_CODE_TO_DISPLAY_NAME[currentPageCountryCode]}`
                : ''}{' '}
              are only available to users based in{' '}
              {COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[currentPageCountryCode]}.
            </p>
          </div>
        </div>
      </WrapperContainer>
    </div>
  )
}
