import { useIsMobile } from '@/hooks/useIsMobile'
import {
  SupportedCountryCodes,
  USER_SELECTED_COUNTRY_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import Cookies from 'js-cookie'

const DISCLAIMER_BANNER_COUNTRY_CODES_MAP: Record<
  SupportedCountryCodes,
  {
    label: string
    url: string
    emoji?: string
    countryCode: SupportedCountryCodes
  }
> = {
  [SupportedCountryCodes.GB]: {
    label: 'United Kingdom',
    url: getIntlUrls(SupportedCountryCodes.GB).home(),
    emoji: '🇬🇧',
    countryCode: SupportedCountryCodes.GB,
  },
  [SupportedCountryCodes.CA]: {
    label: 'Canada',
    url: getIntlUrls(SupportedCountryCodes.CA).home(),
    emoji: '🇨🇦',
    countryCode: SupportedCountryCodes.CA,
  },
  [SupportedCountryCodes.AU]: {
    label: 'Australia',
    url: getIntlUrls(SupportedCountryCodes.AU).home(),
    emoji: '🇦🇺',
    countryCode: SupportedCountryCodes.AU,
  },
  [SupportedCountryCodes.US]: {
    label: 'United States',
    url: getIntlUrls(SupportedCountryCodes.US).home(),
    emoji: '🇺🇸',
    countryCode: SupportedCountryCodes.US,
  },
}

export function RedirectBannerContent({ countryCode }: { countryCode: SupportedCountryCodes }) {
  const isMobile = useIsMobile()

  const WrapperContainer = isMobile ? 'button' : 'div'

  const userAccessLocationCountry = DISCLAIMER_BANNER_COUNTRY_CODES_MAP[countryCode]

  const handleWrapperClick = () => {
    if (!userAccessLocationCountry?.url) return
    Cookies.set(USER_SELECTED_COUNTRY_COOKIE_NAME, userAccessLocationCountry.countryCode)
    window.location.href = userAccessLocationCountry?.url
  }

  return (
    <div className="flex h-12 w-full items-center justify-center bg-primary-cta">
      <WrapperContainer
        className="flex h-full w-full items-center text-center"
        {...(isMobile && { onClick: handleWrapperClick })}
      >
        <div className="container flex justify-between">
          <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center sm:text-base">
            <p>
              {userAccessLocationCountry?.emoji ? `${userAccessLocationCountry?.emoji} ` : ''}
              Looking for Stand With Crypto {userAccessLocationCountry.label}? Click{' '}
              <button className="font-bold" onClick={handleWrapperClick}>
                here
              </button>
            </p>
          </div>
        </div>
      </WrapperContainer>
    </div>
  )
}
