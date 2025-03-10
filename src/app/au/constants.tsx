import { NavbarItem } from '@/components/app/navbar'
import { DonateIcon, MissionIcon } from '@/components/app/navbar/navbarDrawerIcons'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export const getNavbarItems = (countryCode: SupportedCountryCodes): NavbarItem[] => {
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
      ],
    },
  ]
}
