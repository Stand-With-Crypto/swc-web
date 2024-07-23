'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useIsMobile } from '@/hooks/useIsMobile'
import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/shared/getCountryCode'

const languages = getNavigatorLanguages()

export function GeoLocationDisclaimerBanner() {
  const hasHydrated = useHasHydrated()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState(false)

  const WrapperContainer = isMobile ? 'button' : 'div'

  const currentCountry = DISCLAIMER_BANNER_COUNTRY_CODES_MAP.find(({ countryCode }) =>
    languages?.includes(countryCode),
  )

  const handleWrapperClick = () => {
    if (!currentCountry?.url) return
    router.push(currentCountry?.url)
  }

  useEffect(() => {
    if (hasHydrated && currentCountry) {
      setTimeout(() => setIsVisible(true), 10)
    }
  }, [currentCountry, hasHydrated])

  const geo = Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)

  if (!hasHydrated) return null

  if (currentCountry) {
    return (
      <div
        className={`flex w-full transition-all duration-200 ${isVisible ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <WrapperContainer
          className="flex h-12 w-full items-center bg-primary-cta text-center"
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

  if (geo !== 'US') {
    return (
      <div className={`flex max-h-12 w-full opacity-100 transition-all duration-200`}>
        <WrapperContainer className="flex h-12 w-full items-center bg-primary-cta text-center">
          <div className="container flex justify-between">
            <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center sm:text-base">
              <p>
                Actions on Stand With Crypto are only available to users based in the United States.
                {JSON.stringify({ geo, eq: geo === 'US' })}
              </p>
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
  countryCode: string
  label: string
  url: string
  emoji?: string
}[] = [
  {
    countryCode: 'en-GB',
    label: 'UK',
    url: 'https://uk.standwithcrypto.org',
    emoji: '🇬🇧',
  },
  {
    countryCode: 'en-CA',
    label: 'Canada',
    url: 'https://ca.standwithcrypto.org',
    emoji: '🇨🇦',
  },
]
