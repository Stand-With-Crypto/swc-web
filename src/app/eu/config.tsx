/* eslint-disable @next/next/no-img-element */

import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
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
      community: 'Community',
      footerTitle: 'Join the Movement',
      footerSubtitle:
        'Join to show your support and protect the future of crypto in Europe. #standwithcrypto',
      termsOfService: 'Terms of service',
      privacyPolicy: 'Privacy',
    },
    de: {
      manifesto: 'Manifesto',
      petitions: 'Petitionen',
      community: 'Gemeinschaft',
      footerTitle: 'Schließe dich der Bewegung an',
      footerSubtitle:
        'Schließe dich an, um deine Unterstützung zu zeigen und die Zukunft von Krypto in Europa zu schützen. #standwithcrypto',
      termsOfService: 'Nutzungsbedingungen',
      privacyPolicy: 'Datenschutz',
    },
    fr: {
      manifesto: 'Manifesto',
      petitions: 'Pétitions',
      community: 'Communauté',
      footerTitle: 'Rejoignez le mouvement',
      footerSubtitle:
        "Rejoignez-nous pour montrer votre soutien et protéger l'avenir de la crypto en Europe. #standwithcrypto",
      termsOfService: "Conditions d'utilisation",
      privacyPolicy: 'Confidentialité',
    },
  },
})

export function getNavbarConfig({
  language = SupportedLanguages.EN,
}: { language?: SupportedLanguages } = {}): NavbarProps {
  const urls = getIntlUrls(countryCode, { language })

  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

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
      {
        href: urls.community(),
        text: t('community'),
      },
    ],
  }
}

export function getFooterConfig({
  language = SupportedLanguages.EN,
}: { language?: SupportedLanguages } = {}): FooterProps {
  const urls = getIntlUrls(countryCode, { language })

  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  return {
    countryCode,
    language,
    title: t('footerTitle'),
    subtitle: t('footerSubtitle'),
    links: [
      { href: urls.termsOfService(), text: t('termsOfService') },
      { href: urls.privacyPolicy(), text: t('privacyPolicy') },
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
