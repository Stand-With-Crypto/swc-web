import { NavbarItem } from '@/components/app/navbar'
import { DonateIcon, MissionIcon } from '@/components/app/navbar/navbarDrawerIcons'
import { getIntlUrls } from '@/utils/shared/urls'

export const getCaNavbarItems = (urls: ReturnType<typeof getIntlUrls>): NavbarItem[] => {
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
      ],
    },
  ]
}
