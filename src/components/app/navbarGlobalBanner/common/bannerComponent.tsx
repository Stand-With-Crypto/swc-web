'use client'

import { ReactNode } from 'react'
import Cookies from 'js-cookie'

import { RedirectBannerContent } from '@/components/app/navbarGlobalBanner/common/redirectbannerContent'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  COUNTRY_CODE_TO_DISPLAY_NAME_KEY,
  COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX_KEY,
  withI18nCommons,
} from '@/utils/shared/i18n/commons'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import {
  COUNTRY_CODE_REGEX_PATTERN,
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      start: 'Actions on Stand With Crypto',
      middle: 'are only available to users based in',
    },
    fr: {
      start: 'Les actions sur Stand With Crypto',
      middle: 'ne sont disponibles que pour les utilisateurs basés en',
    },
    de: {
      start: 'Aktionen auf Stand With Crypto',
      middle: 'sind nur für Nutzer verfügbar, die in',
    },
  },
})

export function NavBarGlobalBanner({
  countryCode: currentPageCountryCode,
  currentCampaignComponent,
}: {
  countryCode: SupportedCountryCodes
  currentCampaignComponent: ReactNode
}) {
  const isMobile = useIsMobile()
  const { t } = useTranslation(withI18nCommons(i18nMessages))

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
          <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center max-[400px]:text-xs sm:text-base">
            <p>
              {t('start')}
              {currentPageCountryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE
                ? ` ${t(COUNTRY_CODE_TO_DISPLAY_NAME_KEY[currentPageCountryCode])}`
                : ''}{' '}
              {t('middle')}{' '}
              {t(COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX_KEY[currentPageCountryCode])}
            </p>
          </div>
        </div>
      </WrapperContainer>
    </div>
  )
}
