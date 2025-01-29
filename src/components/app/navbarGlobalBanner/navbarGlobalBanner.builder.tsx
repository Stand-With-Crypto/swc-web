import { Builder } from '@builder.io/react'

import { NavBarGlobalBanner } from '@/components/app/navbarGlobalBanner'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

interface BuilderNavBarGlobalBannerProps extends BuilderComponentBaseProps {
  outsideUSBannerText: string
  hideBanner?: boolean
  campaignText?: string
}

Builder.registerComponent(
  (props: BuilderNavBarGlobalBannerProps) => (
    <NavBarGlobalBanner
      {...props.attributes}
      campaignText={props.campaignText}
      hideBanner={props.hideBanner}
      key={props.attributes?.key}
    />
  ),
  {
    name: 'NavBarGlobalBanner',
    friendlyName: 'Navbar Global Banner',
    canHaveChildren: false,
    noWrap: true,
    inputs: [
      {
        name: 'hideBanner',
        friendlyName: 'Hide banner',
        type: 'boolean',
        defaultValue: false,
        helperText: 'If true, the banner will not be displayed.',
      },
      {
        name: 'campaignText',
        friendlyName: 'Campaign text',
        type: 'text',
        helperText: 'This is a campaign text that will be displayed in the navbar.',
      },
    ],
  },
)
