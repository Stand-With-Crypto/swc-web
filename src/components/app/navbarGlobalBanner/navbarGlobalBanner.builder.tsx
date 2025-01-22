import { Builder } from '@builder.io/react'

import { NavBarGlobalBanner, NavBarGlobalBannerProps } from '@/components/app/navbarGlobalBanner'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

type BuilderNavBarGlobalBannerProps = BuilderComponentBaseProps & {
  builderState: {
    content: {
      data: NavBarGlobalBannerProps
    }
  }
}

Builder.registerComponent(
  (props: BuilderNavBarGlobalBannerProps) => (
    <NavBarGlobalBanner outsideUSBannerText={props.builderState.content.data.outsideUSBannerText} />
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
    ],
  },
)
