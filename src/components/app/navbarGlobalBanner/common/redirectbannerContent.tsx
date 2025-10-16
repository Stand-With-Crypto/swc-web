import Cookies from 'js-cookie'

import { useIsMobile } from '@/hooks/useIsMobile'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { withI18nCommons } from '@/utils/shared/i18n/commons'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import {
  SupportedCountryCodes,
  USER_SELECTED_COUNTRY_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      lookingFor: 'Looking for Stand With Crypto {country}?',
      click: 'Click',
      here: 'here',
    },
    fr: {
      lookingFor: 'Vous cherchez Stand With Crypto {country} ?',
      click: 'Cliquez',
      here: 'ici',
    },
    de: {
      lookingFor: 'Suchen Sie Stand With Crypto {country}?',
      click: 'Klicken Sie',
      here: 'hier',
    },
  },
})

function getDisclaimerBannerCountryInfos(
  countryCode: SupportedCountryCodes,
  language: SupportedLanguages = SupportedLanguages.EN,
) {
  const { t } = getStaticTranslation(withI18nCommons(i18nMessages), language, countryCode)

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
    [SupportedCountryCodes.EU]: {
      label: t('EU'),
      url: getIntlUrls(SupportedCountryCodes.EU, { language }).home(),
      emoji: '🇪🇺',
      countryCode: SupportedCountryCodes.EU,
    },
  }

  return DISCLAIMER_BANNER_COUNTRY_CODES_MAP[countryCode]
}

export function RedirectBannerContent({
  countryCode,
  language = SupportedLanguages.EN,
}: {
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
}) {
  const isMobile = useIsMobile()

  const { t } = getStaticTranslation(withI18nCommons(i18nMessages), language, countryCode)

  const WrapperContainer = isMobile ? 'button' : 'div'

  const userAccessLocationCountry = getDisclaimerBannerCountryInfos(countryCode, language)

  const handleWrapperClick = () => {
    if (!userAccessLocationCountry?.url) return
    Cookies.set(USER_SELECTED_COUNTRY_COOKIE_NAME, userAccessLocationCountry.countryCode)
    window.location.href = userAccessLocationCountry?.url
  }

  const hereTextSection = isMobile ? (
    <span className="font-bold">{t('here')}</span>
  ) : (
    <button className="font-bold" onClick={handleWrapperClick}>
      {t('here')}
    </button>
  )

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
              {t('lookingFor', { country: userAccessLocationCountry.label })} {t('click')}{' '}
              {hereTextSection}
            </p>
          </div>
        </div>
      </WrapperContainer>
    </div>
  )
}
