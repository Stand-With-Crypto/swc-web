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
      outsideUSBannerText={props.outsideUSBannerText}
    />
  ),
  {
    name: 'NavBarGlobalBanner',
    friendlyName: 'Navbar Global Banner',
    canHaveChildren: false,
    noWrap: true,
    inputs: [
      {
        name: 'outsideUSBannerText',
        friendlyName: 'Outside of the US banner text',
        type: 'text',
        helperText:
          'This text will be displayed in the navbar when the user is outside of the United States.',
        defaultValue:
          'Actions on Stand With Crypto are only available to users based in the United States.',
      },
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
