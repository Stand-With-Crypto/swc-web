import { NavbarItem } from '@/components/app/navbar'
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
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export const getDefaultNavbarItems = (countryCode: SupportedCountryCodes): NavbarItem[] => {
  const urls = getIntlUrls(countryCode)

  return [
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
  ]
}
