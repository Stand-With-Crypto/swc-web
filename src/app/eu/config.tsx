/* eslint-disable @next/next/no-img-element */

import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import { getSimpleTranslation } from '@/utils/server/i18n/getSimpleTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { euExternalUrls, getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.EU

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      manifesto: 'Manifesto',
      petitions: 'Petitions',
    },
    de: {
      manifesto: 'Manifesto',
      petitions: 'Petitionen',
    },
    fr: {
      manifesto: 'Manifesto',
      petitions: 'Pétitions',
    },
  },
})

export function getNavbarConfig({
  language = SupportedLanguages.EN,
}: { language?: SupportedLanguages } = {}): NavbarProps {
  const urls = getIntlUrls(countryCode, { language })

  const { t } = getSimpleTranslation(i18nMessages, language, countryCode)

  return {
    countryCode,
    language,
    logo: {
      src: '/logo/shield.svg',
      width: 40,
      height: 40,
    },
    items: [
      {
        href: urls.manifesto(),
        text: t('manifesto'),
      },
      {
        href: urls.petitions(),
        text: t('petitions'),
      },
    ],
  }
}

//TODO(EU): Add actual EU footer items
//TODO(EU): Add internationalization here
export function getFooterConfig({ language }: { language?: SupportedLanguages } = {}): FooterProps {
  const urls = getIntlUrls(countryCode, { language })

  return {
    countryCode,
    title: 'Join the Movement',
    subtitle:
      'Join to show your support and protect the future of crypto in Europe. #standwithcrypto',
    links: [
      { href: urls.termsOfService(), text: 'Terms of service' },
      { href: urls.privacyPolicy(), text: 'Privacy' },
    ],
    socialLinks: [
      {
        href: euExternalUrls.twitter(),
        text: 'Twitter / X',
      },
      {
        href: euExternalUrls.linkedin(),
        text: 'LinkedIn',
      },
    ],
    sendFeedbackLink: euExternalUrls.emailFeedback(),
  }
}
