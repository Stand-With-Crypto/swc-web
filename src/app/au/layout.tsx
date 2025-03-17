/* eslint-disable @next/next/no-img-element */
import { Metadata } from 'next'

import { Footer, FooterProps } from '@/components/app/footer'
import { PageLayout } from '@/components/app/layout/layout'
import { Navbar, NavbarProps } from '@/components/app/navbar'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { auExternalUrls, getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.AU

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

const urls = getIntlUrls(countryCode)

const navbarConfig: NavbarProps = {
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
      href: urls.about(),
      text: 'Our mission',
    },
    {
      href: urls.partners(),
      text: 'Partners',
    },
    {
      href: urls.events(),
      text: 'Events',
    },
    {
      href: urls.press(),
      text: 'Press',
    },
  ],
}

const footerConfig: FooterProps = {
  countryCode,
  title: 'Fight for the future',
  subtitle:
    'Join to show your support, collect advocacy NFTs, and protect the future of crypto. #standwithcrypto',
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
    { href: urls.termsOfService(), text: 'Terms of service' },
  ],
  socialLinks: [
    {
      href: auExternalUrls.discord(),
      text: 'Discord',
    },
    {
      href: auExternalUrls.twitter(),
      text: 'Twitter / X',
    },
    {
      href: auExternalUrls.instagram(),
      text: 'Instagram',
    },
    {
      href: auExternalUrls.youtube(),
      text: 'Youtube',
    },
    {
      href: auExternalUrls.facebook(),
      text: 'Facebook',
    },
    {
      href: auExternalUrls.linkedin(),
      text: 'LinkedIn',
    },
    {
      href: auExternalUrls.emailFeedback(),
      text: 'Send feedback',
    },
  ],
}

export default async function AuLayout({ children }: React.PropsWithChildren) {
  return (
    <PageLayout
      countryCode={countryCode}
      footer={<Footer {...footerConfig} />}
      navbar={<Navbar {...navbarConfig} />}
    >
      {children}
    </PageLayout>
  )
}
