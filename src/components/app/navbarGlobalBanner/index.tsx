'use client'

import Cookies from 'js-cookie'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import {
  COUNTRY_CODE_TO_DISPLAY_NAME,
  COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX,
} from '@/utils/shared/intl/displayNames'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const languages = getNavigatorLanguages()

export function NavBarGlobalBanner({
  countryCode: propCountryCode,
}: {
  countryCode: SupportedCountryCodes
}) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const hasHydrated = useHasHydrated()

  const WrapperContainer = isMobile ? 'button' : 'div'

  const userCountryCode = Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)
  const parsedExistingCountryCode = parseUserCountryCodeCookie(userCountryCode)

  const currentCountry = DISCLAIMER_BANNER_COUNTRY_CODES_MAP.find(
    ({ language, countryCode }) =>
      parsedExistingCountryCode?.countryCode === countryCode || languages?.includes(language),
  )

  const handleWrapperClick = () => {
    if (!currentCountry?.url) return
    router.push(currentCountry?.url)
  }

  if (!hasHydrated) {
    return <CurrentCampaign />
  }

  if (currentCountry && propCountryCode !== currentCountry.countryCode) {
    return (
      <div className="flex h-12 w-full items-center justify-center bg-primary-cta">
        <WrapperContainer
          className="flex h-full w-full items-center text-center"
          {...(isMobile && { onClick: handleWrapperClick })}
        >
          <div className="container flex justify-between">
            <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center sm:text-base">
              <p>
                {currentCountry?.emoji ? `${currentCountry?.emoji} ` : ''}Looking for Stand With
                Crypto {currentCountry.label}? Click{' '}
                <strong>
                  <Link href={currentCountry.url}>here</Link>
                </strong>
              </p>
            </div>
          </div>
        </WrapperContainer>
      </div>
    )
  }

  if (parsedExistingCountryCode?.countryCode !== propCountryCode) {
    return (
      <div className="flex h-12 w-full items-center justify-center bg-primary-cta">
        <WrapperContainer className="flex h-12 w-full items-center bg-primary-cta text-center">
          <div className="container flex justify-between">
            <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center max-[330px]:text-xs sm:text-base">
              <p>
                Actions on Stand With Crypto
                {propCountryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE
                  ? ` ${COUNTRY_CODE_TO_DISPLAY_NAME[propCountryCode]}`
                  : ''}{' '}
                are only available to users based in{' '}
                {COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[propCountryCode]}.
              </p>
            </div>
          </div>
        </WrapperContainer>
      </div>
    )
  }

  return <CurrentCampaign />
}

/**
 * Return window.navigator.languages
 */
function getNavigatorLanguages(): typeof globalThis.window.navigator.languages | null {
  if (typeof window === 'undefined') return null

  return window.navigator.languages
}

const DISCLAIMER_BANNER_COUNTRY_CODES_MAP: readonly {
  language: string
  countryCode: string
  label: string
  url: string
  emoji?: string
}[] = [
  {
    language: 'en-GB',
    countryCode: 'uk',
    label: 'United Kingdom',
    url: getIntlUrls(SupportedCountryCodes.GB).home(),
    emoji: '🇬🇧',
  },
  {
    language: 'en-CA',
    countryCode: 'ca',
    label: 'Canada',
    url: getIntlUrls(SupportedCountryCodes.CA).home(),
    emoji: '🇨🇦',
  },
  {
    language: 'en-AU',
    countryCode: 'au',
    label: 'Australia',
    url: getIntlUrls(SupportedCountryCodes.AU).home(),
  },
]

function CurrentCampaign() {
  return null
}
