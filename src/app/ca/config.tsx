/* eslint-disable @next/next/no-img-element */

import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import * as Icons from '@/components/app/navbar/navbarDrawerIcons'
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
      href: urls.polls(),
      text: 'Polls',
    },
    {
      href: urls.manifesto(),
      text: 'Manifesto',
    },
    {
      text: 'Resources',
      children: [
        {
          href: urls.community(),
          text: 'Community',
          icon: <Icons.CommunityIcon />,
        },
        {
          href: urls.partners(),
          text: 'Partners',
          icon: <Icons.PartnersIcon />,
        },
      ],
    },
  ],
}

export const footerConfig: FooterProps = {
  countryCode,
  title: 'Join the movement for the future of crypto',
  subtitle: 'Protect the future of crypto in Canada. #standwithcrypto',
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
  ],
  sendFeedbackLink: caExternalUrls.emailFeedback(),
}
