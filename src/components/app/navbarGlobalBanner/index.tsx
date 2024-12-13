import Balancer from 'react-wrap-balancer'
import Cookies from 'js-cookie'
import { ArrowRight } from 'lucide-react'

import { InternalLink } from '@/components/ui/link'
import { SupportedLocale } from '@/intl/locales'
import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import { getIntlUrls } from '@/utils/shared/urls'

interface NavbarGlobalBannerProps {
  locale: SupportedLocale
}

export function NavbarGlobalBanner({ locale }: NavbarGlobalBannerProps) {
  const urls = getIntlUrls(locale)

  const userCountryCode = Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)
  const parsedExistingCountryCode = parseUserCountryCodeCookie(userCountryCode)

  if (parsedExistingCountryCode?.countryCode !== 'US') return null

  return (
    <InternalLink
      className="flex w-full items-center bg-primary-cta text-center opacity-100 transition-all duration-200"
      href={urls.emailDeeplink()}
    >
      <div className="container flex w-full justify-between">
        <div className="flex w-full items-center justify-center py-2 text-center text-base text-white antialiased">
          <Balancer>
            Make your voice heard — tell your Senators to vote NO on an anti-crypto SEC nominee!
          </Balancer>
          <ArrowRight className="w-12 lg:w-8" size={16} />
        </div>
      </div>
    </InternalLink>
  )
}
