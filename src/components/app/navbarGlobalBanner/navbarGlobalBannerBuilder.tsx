'use client'

import '@/utils/web/builder/registerComponents'

import { Content } from '@builder.io/react'

import { RenderBuilderContent } from '@/components/app/builder'
import { RenderComponentModelTypes } from '@/components/app/builder/constants'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'
import { maybeInitBuilderReactClient } from '@/utils/web/builder/maybeInitBuilderReactClient'

maybeInitBuilderReactClient()

export function NavBarGlobalBannerBuilder({ content }: { content: Content }) {
  return (
    <RenderBuilderContent
      content={content}
      model={BuilderSectionModelIdentifiers.BANNER}
      modelType={RenderComponentModelTypes.SECTION}
    />
  )
}
