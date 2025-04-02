import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const DISCLAIMER_BANNER_COUNTRY_CODES_MAP: Record<
  SupportedCountryCodes,
  {
    label: string
    url: string
    emoji?: string
  }
> = {
  [SupportedCountryCodes.GB]: {
    label: 'United Kingdom',
    url: getIntlUrls(SupportedCountryCodes.GB).home(),
    emoji: '🇬🇧',
  },
  [SupportedCountryCodes.CA]: {
    label: 'Canada',
    url: getIntlUrls(SupportedCountryCodes.CA).home(),
    emoji: '🇨🇦',
  },
  [SupportedCountryCodes.AU]: {
    label: 'Australia',
    url: getIntlUrls(SupportedCountryCodes.AU).home(),
    emoji: '🇦🇺',
  },
  [SupportedCountryCodes.US]: {
    label: 'United States',
    url: getIntlUrls(SupportedCountryCodes.US).home(),
    emoji: '🇺🇸',
  },
}

export function RedirectBannerContent({ countryCode }: { countryCode: SupportedCountryCodes }) {
  const router = useRouter()
  const isMobile = useIsMobile()

  const WrapperContainer = isMobile ? 'button' : 'div'

  const userAccessLocationCountry = DISCLAIMER_BANNER_COUNTRY_CODES_MAP[countryCode]

  const handleWrapperClick = () => {
    if (!userAccessLocationCountry?.url) return
    router.push(userAccessLocationCountry?.url)
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
              <strong>
                <Link href={userAccessLocationCountry.url}>here</Link>
              </strong>
            </p>
          </div>
        </div>
      </WrapperContainer>
    </div>
  )
}
