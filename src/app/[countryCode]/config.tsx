import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import * as Icons from '@/components/app/navbar/navbarDrawerIcons'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { usExternalUrls } from '@/utils/shared/urls/externalUrls'

const urls = getIntlUrls(DEFAULT_SUPPORTED_COUNTRY_CODE)

export const navbarConfig: NavbarProps = {
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
      href: urls.donate(),
      text: 'Donate',
    },
    {
      text: 'Resources',
      children: [
        {
          href: urls.referrals(),
          text: 'Referrals',
          icon: <Icons.ReferralsIcon />,
        },
        {
          href: urls.about(),
          text: 'Our mission',
          icon: <Icons.MissionIcon />,
        },
        {
          href: urls.community({ tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY }),
          text: 'Community',
          icon: <Icons.CommunityIcon />,
        },
        {
          href: urls.partners(),
          text: 'Partners',
          icon: <Icons.PartnersIcon />,
        },
        {
          href: urls.bills(),
          text: 'Bills',
          icon: <Icons.BillsIcon />,
        },
        {
          href: urls.creatorDefenseFund(),
          text: 'Creator Defense Fund',
          icon: <Icons.CreatorDefenseIcon />,
        },
        {
          href: urls.advocacyToolkit(),
          text: 'Advocacy toolkit',
          icon: <Icons.AdvocacyToolkitIcon />,
        },
        {
          href: urls.press(),
          text: 'Press',
          icon: <Icons.PressIcon />,
        },
        {
          href: urls.polls(),
          text: 'Polls',
          icon: <Icons.PollsIcon />,
        },
      ],
    },
  ],
}

export const footerConfig: FooterProps = {
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
    {
      href: urls.community({ tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY }),
      text: 'Community',
    },
    { href: urls.contentClarity(), text: 'CLARITY resources' },
    { href: urls.contentGenius(), text: 'GENIUS resources' },
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
  ],
  sendFeedbackLink: usExternalUrls.emailFeedback(),
}
