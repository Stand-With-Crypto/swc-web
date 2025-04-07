/* eslint-disable @next/next/no-img-element */

import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { caExternalUrls, getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.CA

const urls = getIntlUrls(countryCode)

export const navbarConfig: NavbarProps = {
  countryCode,
  logo: {
    src: '/ca/logo/shield-text.svg',
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
  ],
}

export const footerConfig: FooterProps = {
  countryCode,
  title: 'Join the movement for the future of crypto',
  subtitle: 'Protect the future of crypto in Canada. #standwithcrypto',
  legalText: 'Authorized by Coinbase Canada Inc, 745 Thurlow Street, Suite 2400, 613-866-4125.',
  footerBanner: (
    <div className="pointer-events-none min-w-full select-none">
      <img
        alt="Footer Banner"
        className="mx-auto w-full max-w-[1920px]"
        src="/ca/footer-banner.svg"
      />
      <img alt="Footer Banner Divider" className="w-full" src="/ca/footer-banner-divider.png" />
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
      href: caExternalUrls.twitter(),
      text: 'Twitter / X',
    },
    {
      href: caExternalUrls.linkedin(),
      text: 'LinkedIn',
    },
    {
      href: caExternalUrls.emailFeedback(),
      text: 'Send feedback',
    },
  ],
}
