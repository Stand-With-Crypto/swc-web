import { NavbarItem } from '@/components/app/navbar'
import {
  BillsIcon,
  CommunityIcon,
  DonateIcon,
  MissionIcon,
  PartnersIcon,
} from '@/components/app/navbar/navbarDrawerIcons'
import { getIntlUrls } from '@/utils/shared/urls'

export const getGbNavbarItems = (urls: ReturnType<typeof getIntlUrls>): NavbarItem[] => {
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
      ],
    },
  ]
}
