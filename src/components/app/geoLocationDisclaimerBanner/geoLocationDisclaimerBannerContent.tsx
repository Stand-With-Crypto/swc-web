'use client'

import Balancer from 'react-wrap-balancer'
import Cookies from 'js-cookie'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { InternalLink } from '@/components/ui/link'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLocale } from '@/hooks/useLocale'
import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import { SUPPORTED_COUNTRY_CODES } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const languages = getNavigatorLanguages()

export function GeoLocationDisclaimerBannerContent() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const locale = useLocale()
  const urls = getIntlUrls(locale)

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

  if (currentCountry) {
    return (
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
    )
  }

  if (parsedExistingCountryCode?.countryCode !== SUPPORTED_COUNTRY_CODES.US) {
    return (
      <WrapperContainer className="flex h-12 w-full items-center bg-primary-cta text-center">
        <div className="container flex justify-between">
          <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center sm:text-base">
            <p>
              Actions on Stand With Crypto are only available to users based in the United States.
            </p>
          </div>
        </div>
      </WrapperContainer>
    )
  }

  return (
    <InternalLink className="h-full w-full" href={urls.emailDeeplink()}>
      <div className="flex h-full w-full items-center justify-center py-2 text-center text-base leading-normal text-white antialiased">
        <Balancer>
          Make your voice heard — tell your Senators to vote NO on an anti-crypto SEC nominee!
        </Balancer>
        <ArrowRight className="w-12 lg:w-8" size={16} />
      </div>
    </InternalLink>
  )
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
