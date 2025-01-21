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
    canHaveChildren: false,
    override: true,
    inputs: [
      {
        name: 'outsideUSBannerText',
        type: 'text',
        defaultValue:
          'Actions on Stand With Crypto are only available to users based in the United States.',
      },
    ],
  },
)
