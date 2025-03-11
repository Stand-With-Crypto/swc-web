import { NavbarItem } from '@/components/app/navbar'
import { getAUNavbarItems } from '@/components/app/navbar/au/utils'
import { getCANavbarItems } from '@/components/app/navbar/ca/utils'
import { getGBNavbarItems } from '@/components/app/navbar/gb/utils'
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

export const getDefaultNavbarItems = (urls: ReturnType<typeof getIntlUrls>): NavbarItem[] => {
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

export const getNavbarItems = (countryCode: SupportedCountryCodes): NavbarItem[] => {
  const urls = getIntlUrls(countryCode)

  const navbarItemsCountryMap: Record<
    SupportedCountryCodes,
    (urls: ReturnType<typeof getIntlUrls>) => NavbarItem[]
  > = {
    [SupportedCountryCodes.AU]: getAUNavbarItems,
    [SupportedCountryCodes.CA]: getCANavbarItems,
    [SupportedCountryCodes.GB]: getGBNavbarItems,
    [SupportedCountryCodes.US]: getDefaultNavbarItems,
  }

  return navbarItemsCountryMap[countryCode]?.(urls) ?? getDefaultNavbarItems(urls)
}
