/* eslint-disable @next/next/no-img-element */

import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { euExternalUrls, getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.EU

//TODO(EU): Add EU navbar items
//TODO(EU): Add internationalization here
export function getNavbarConfig({ language }: { language?: SupportedLanguages } = {}): NavbarProps {
  const urls = getIntlUrls(countryCode, { language })

  return {
    countryCode,
    logo: {
      src: '/logo/shield.svg',
      width: 40,
      height: 40,
    },
    items: [
      {
        href: urls.manifesto(),
        text: 'Manifesto',
      },
      {
        href: urls.petitions(),
        text: 'Petitions',
      },
      {
        href: urls.partners(),
        text: 'Partners',
      },
      {
        href: urls.press(),
        text: 'Press',
      },
      {
        href: urls.events(),
        text: 'Events',
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
