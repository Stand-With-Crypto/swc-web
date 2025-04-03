/* eslint-disable @next/next/no-img-element */

import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { gbExternalUrls, getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.GB

const urls = getIntlUrls(countryCode)

export const navbarConfig: NavbarProps = {
  countryCode,
  logo: {
    src: '/gb/logo/shield-text.svg',
    width: 120,
    height: 40,
  },
  items: [
    {
      href: urls.manifesto(),
      text: 'Manifesto',
    },
    {
      href: urls.partners(),
      text: 'Partners',
    },
    {
      href: urls.community(),
      text: 'Community',
    },
    {
      href: urls.press(),
      text: 'Press',
    },
  ],
}

export const footerConfig: FooterProps = {
  countryCode,
  title: 'Fight for the future',
  subtitle:
    'Join to show your support, collect advocacy NFTs, and protect the future of crypto. #standwithcrypto',
  footerBanner: (
    <div className="pointer-events-none min-w-full select-none">
      <img
        alt="Footer Banner"
        className="mx-auto w-full max-w-[1920px]"
        src="/gb/footer-banner.svg"
      />
      <img alt="Footer Banner Divider" className="w-full" src="/gb/footer-banner-divider.png" />
    </div>
  ),
  links: [
    {
      href: urls.privacyPolicy(),
      text: 'Privacy',
    },
    { href: urls.termsOfService(), text: 'Terms of service' },
  ],
  socialLinks: [
    {
      href: gbExternalUrls.twitter(),
      text: 'Twitter / X',
    },
    {
      href: gbExternalUrls.linkedin(),
      text: 'LinkedIn',
    },
    {
      href: gbExternalUrls.emailFeedback(),
      text: 'Send feedback',
    },
  ],
}
