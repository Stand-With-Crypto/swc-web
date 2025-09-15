/* eslint-disable @next/next/no-img-element */

import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { euExternalUrls, getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.EU

const urls = getIntlUrls(countryCode)

//TODO(EU): Add EU navbar items
export const navbarConfig: NavbarProps = {
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
      href: urls.community(),
      text: 'Community',
    },
  ],
}

//TODO(EU): Add EU footer items
export const footerConfig: FooterProps = {
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
