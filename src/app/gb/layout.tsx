/* eslint-disable @next/next/no-img-element */
import { Metadata } from 'next'

import { Footer, FooterProps } from '@/components/app/footer'
import { PageLayout } from '@/components/app/layout/layout'
import { Navbar, NavbarProps } from '@/components/app/navbar'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { gbExternalUrls, getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.GB

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

const urls = getIntlUrls(countryCode)

const navbarConfig: NavbarProps = {
  countryCode,
  logo: {
    src: '/gb/logo/shield-text.svg',
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
      href: gbExternalUrls.discord(),
      text: 'Discord',
    },
    {
      href: gbExternalUrls.twitter(),
      text: 'Twitter / X',
    },
    {
      href: gbExternalUrls.instagram(),
      text: 'Instagram',
    },
    {
      href: gbExternalUrls.youtube(),
      text: 'Youtube',
    },
    {
      href: gbExternalUrls.facebook(),
      text: 'Facebook',
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

export default async function GbLayout({ children }: React.PropsWithChildren) {
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
