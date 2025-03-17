import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Footer, FooterProps } from '@/components/app/footer'
import { PageLayout } from '@/components/app/layout/layout'
import { Navbar, NavbarProps } from '@/components/app/navbar'
import {
  AdvocacyToolkitIcon,
  BillsIcon,
  CommunityIcon,
  CreatorDefenseIcon,
  DonateIcon,
  MissionIcon,
  PartnersIcon,
  PressIcon,
} from '@/components/app/navbar/navbarDrawerIcons'
import { PageProps } from '@/types'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls, usExternalUrls } from '@/utils/shared/urls'

export { viewport } from '@/utils/server/metadataUtils'

// we want dynamicParams to be false for this top level layout, but we also want to ensure that subpages can have dynamic params
// Next.js doesn't allow this so we allow dynamic params in the config here, and then trigger a notFound in the layout if one is passed
// export const dynamicParams = false
export async function generateStaticParams() {
  return [{ countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE }]
}

export const metadata: Metadata = generateCountryCodeLayoutMetadata(DEFAULT_SUPPORTED_COUNTRY_CODE)

const urls = getIntlUrls(DEFAULT_SUPPORTED_COUNTRY_CODE)

const navbarConfig: NavbarProps = {
  countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE,
  showDonateButton: true,
  items: [
    {
      href: urls.politiciansHomepage(),
      text: 'Politician scores',
    },
    {
      href: urls.events(),
      text: 'Events',
    },
    {
      text: 'Resources',
      children: [
        {
          href: urls.donate(),
          text: 'Donate',
          icon: <DonateIcon />,
        },
        {
          href: urls.about(),
          text: 'Our mission',
          icon: <MissionIcon />,
        },
        {
          href: urls.community(),
          text: 'Community',
          icon: <CommunityIcon />,
        },
        {
          href: urls.partners(),
          text: 'Partners',
          icon: <PartnersIcon />,
        },
        {
          href: urls.bills(),
          text: 'Bills',
          icon: <BillsIcon />,
        },
        {
          href: urls.creatorDefenseFund(),
          text: 'Creator Defense Fund',
          icon: <CreatorDefenseIcon />,
        },
        {
          href: urls.advocacyToolkit(),
          text: 'Advocacy toolkit',
          icon: <AdvocacyToolkitIcon />,
        },

        {
          href: urls.press(),
          text: 'Press',
          icon: <PressIcon />,
        },
      ],
    },
  ],
}

const footerConfig: FooterProps = {
  countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE,
  title: 'Fight for Crypto Rights',
  subtitle:
    'Join to show your support, collect advocacy NFTs, and protect the future of crypto. #StandWithCrypto',
  links: [
    { href: urls.termsOfService(), text: 'Terms of service' },
    {
      href: urls.privacyPolicy(),
      text: 'Privacy Policy',
    },
    {
      href: urls.contribute(),
      text: 'Contribute',
    },
    {
      href: urls.questionnaire(),
      text: 'Questionnaire',
    },
    { href: urls.leaderboard(), text: 'Community' },
    { href: urls.resources(), text: 'FIT21 resources' },
  ],
  socialLinks: [
    {
      href: usExternalUrls.twitter(),
      text: 'Twitter / X',
    },
    {
      href: usExternalUrls.youtube(),
      text: 'Youtube',
    },
    {
      href: usExternalUrls.instagram(),
      text: 'Instagram',
    },
    {
      href: usExternalUrls.facebook(),
      text: 'Facebook',
    },
    {
      href: usExternalUrls.linkedin(),
      text: 'LinkedIn',
    },
    {
      href: usExternalUrls.discord(),
      text: 'Discord',
    },
    {
      href: usExternalUrls.emailFeedback(),
      text: 'Send feedback',
    },
  ],
}

export default async function Layout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  const { countryCode } = await params

  if (countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE) {
    notFound()
  }

  return (
    <PageLayout
      countryCode={countryCode}
      footer={<Footer {...footerConfig} />}
      navbar={<Navbar {...navbarConfig} />}
      shouldRenderGTM
    >
      {children}
    </PageLayout>
  )
}
