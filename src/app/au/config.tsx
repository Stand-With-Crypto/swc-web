/* eslint-disable @next/next/no-img-element */

import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import * as Icons from '@/components/app/navbar/navbarDrawerIcons'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { auExternalUrls, getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.AU

const urls = getIntlUrls(countryCode)

export const navbarConfig: NavbarProps = {
  countryCode,
  logo: {
    src: '/au/logo/shield-text.svg',
    width: 120,
    height: 40,
  },
  items: [
    {
      href: urls.politiciansHomepage(),
      text: 'Politician scores',
    },
    {
      href: urls.locationKeyRaces(),
      text: 'Races',
    },
    {
      href: urls.polls(),
      text: 'Polls',
    },
    {
      href: urls.manifesto(),
      text: 'Manifesto',
    },
  ],
}

export const footerConfig: FooterProps = {
  countryCode,
  title: 'Join the Movement',
  subtitle:
    'Join to show your support, collect advocacy NFTs, and protect the future of crypto. #standwithcrypto',
  legalText: 'Authorised by J. O’Loghlen, Coinbase Australia Pty Ltd., Sydney.',
  footerBanner: (
    <div className="pointer-events-none min-w-full select-none">
      <img
        alt="Footer Banner"
        className="mx-auto w-full max-w-[1920px]"
        src="/au/footer-banner.svg"
      />
      <img alt="Footer Banner Divider" className="w-full" src="/au/footer-banner-divider.png" />
    </div>
  ),
  links: [
    {
      href: urls.privacyPolicy(),
      text: 'Privacy',
    },
  ],
  socialLinks: [
    {
      href: auExternalUrls.twitter(),
      text: 'Twitter / X',
    },
    {
      href: auExternalUrls.linkedin(),
      text: 'LinkedIn',
    },
  ],
  sendFeedbackLink: auExternalUrls.emailFeedback(),
}
