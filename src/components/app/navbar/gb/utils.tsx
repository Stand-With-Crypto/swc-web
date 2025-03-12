import { NavbarItem } from '@/components/app/navbar'
import { MissionIcon } from '@/components/app/navbar/navbarDrawerIcons'
import { getIntlUrls } from '@/utils/shared/urls'

export const getGBNavbarItems = (urls: ReturnType<typeof getIntlUrls>): NavbarItem[] => {
  return [
    {
      href: urls.politiciansHomepage(),
      text: 'Politician scores',
    },
    {
      text: 'Resources',
      children: [
        {
          href: urls.about(),
          text: 'Our mission',
          icon: <MissionIcon />,
        },
      ],
    },
  ]
}
