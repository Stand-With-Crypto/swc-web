import { Builder } from '@builder.io/react'

import { HeroImageWrapper, HeroImageWrapperProps } from '@/components/app/heroImageWrapper'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

type BuilderHeroImageWrapperProps = BuilderComponentBaseProps & {
  builderState: {
    content: {
      data: HeroImageWrapperProps
    }
  }
}

Builder.registerComponent(
  (props: BuilderHeroImageWrapperProps) => (
    <HeroImageWrapper
      authenticatedProps={props.builderState.content.data.authenticatedProps}
      unauthenticatedProps={props.builderState.content.data.unauthenticatedProps}
    />
  ),
  {
    name: 'HeroImageWrapper',
    canHaveChildren: false,
    override: true,
    inputs: [
      {
        name: 'unauthenticatedProps',
        type: 'object',
        defaultValue: {
          title: 'Join Stand With Crypto and help us defend your right to own crypto in America.',
          ctaText: 'Join',
        },
      },
      {
        name: 'authenticatedProps',
        type: 'object',
        defaultValue: {
          title: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
          ctaText: 'Follow',
        },
      },
    ],
  },
)
