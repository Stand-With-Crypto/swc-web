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
import { SUPPORTED_COUNTRY_CODES } from '@/utils/shared/supportedCountries'

const languages = getNavigatorLanguages()

export interface NavBarGlobalBannerProps {
  outsideUSBannerText?: string
  hideBanner?: boolean
  campaignText?: string
}

export function NavBarGlobalBanner({
  outsideUSBannerText = 'Actions on Stand With Crypto are only available to users based in the United States.',
  hideBanner = false,
  campaignText,
}: NavBarGlobalBannerProps) {
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

  console.log('hasHydrated', hasHydrated)
  console.log('campaignText', campaignText)
  console.log('will return null', hideBanner || !hasHydrated)

  if (hideBanner || !hasHydrated) {
    return null
  }

  if (currentCountry) {
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

  if (parsedExistingCountryCode?.countryCode !== SUPPORTED_COUNTRY_CODES.US) {
    return (
      <div className="flex h-12 w-full items-center justify-center bg-primary-cta">
        <WrapperContainer className="flex h-12 w-full items-center bg-primary-cta text-center">
          <div className="container flex justify-between">
            <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center sm:text-base">
              <p>{outsideUSBannerText}</p>
            </div>
          </div>
        </WrapperContainer>
      </div>
    )
  }

  if (campaignText) {
    return (
      <div className="flex h-12 w-full items-center justify-center bg-primary-cta">
        <WrapperContainer className="flex h-12 w-full items-center bg-primary-cta text-center">
          <div className="container flex justify-between">
            <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center sm:text-base">
              <p>{campaignText}</p>
            </div>
          </div>
        </WrapperContainer>
      </div>
    )
  }

  return null
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
    countryCode: 'UK',
    label: 'United Kingdom',
    url: 'https://uk.standwithcrypto.org',
    emoji: '🇬🇧',
  },
  {
    language: 'en-CA',
    countryCode: 'CA',
    label: 'Canada',
    url: 'https://ca.standwithcrypto.org',
    emoji: '🇨🇦',
  },
]
